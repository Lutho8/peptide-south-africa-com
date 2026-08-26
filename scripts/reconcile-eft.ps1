[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^PSA-[A-Z0-9-]+$')]
    [string] $Reference,

    [Parameter()]
    [ValidatePattern('^[0-9a-fA-F-]{36}$')]
    [string] $OrderId,

    [Parameter(Mandatory = $true)]
    [ValidateRange(0.01, 10000000)]
    [decimal] $Amount,

    [Parameter()]
    [datetime] $ReceivedAt = (Get-Date),

    [Parameter()]
    [ValidateLength(0, 200)]
    [string] $PayerName,

    [Parameter()]
    [ValidateScript({
        $uri = [Uri] $_
        $isProduction = $uri.AbsoluteUri -eq 'https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/eft-reconcile'
        $isLocalTest = $uri.IsLoopback -and $uri.Scheme -eq 'http'
        if (-not ($isProduction -or $isLocalTest)) {
            throw 'Endpoint must be the production EFT function or a loopback HTTP test endpoint.'
        }
        return $true
    })]
    [string] $Endpoint = 'https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/eft-reconcile'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$normalisedReference = $Reference.Replace(' ', '').ToUpperInvariant()
Write-Host "Target: $normalisedReference / R$($Amount.ToString('0.00'))"
if ($OrderId) {
    Write-Host "Order ID: $OrderId"
}
Write-Host 'Check the bank account transaction itself. A proof-of-payment document is not sufficient.'

$confirmation = Read-Host "Type DEPOSIT VERIFIED only if the exact reference and amount appear in the bank account"
if ($confirmation -cne 'DEPOSIT VERIFIED') {
    throw 'Reconciliation refused: the matching bank deposit was not explicitly confirmed.'
}

$secureSecret = Read-Host 'EFT_RECONCILE_SECRET' -AsSecureString
if ($secureSecret.Length -eq 0) {
    throw 'Reconciliation refused: EFT_RECONCILE_SECRET was empty.'
}

$deposit = [ordered]@{
    amount      = $Amount
    reference   = $normalisedReference
    received_at = $ReceivedAt.ToUniversalTime().ToString('o')
}
if ($PayerName) {
    $deposit.payer_name = $PayerName
}

$request = [ordered]@{
    reference = $normalisedReference
    deposits  = @($deposit)
}
if ($OrderId) {
    $request.order_id = $OrderId
}

$secretPointer = [IntPtr]::Zero
$plainSecret = $null
$headers = @{}
try {
    $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
    $plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
    $headers['x-eft-secret'] = $plainSecret

    $response = Invoke-RestMethod `
        -Method Post `
        -Uri $Endpoint `
        -ContentType 'application/json' `
        -Headers $headers `
        -Body ($request | ConvertTo-Json -Depth 6 -Compress)
}
finally {
    $headers.Clear()
    $plainSecret = $null
    if ($secretPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
    }
    $secureSecret.Dispose()
}

if (-not $response.ok) {
    throw 'The reconciliation endpoint did not return a verified success response.'
}
if (-not $response.order_state) {
    throw "No order state was returned for reference $normalisedReference."
}
if ($response.order_state.payment_reference.Replace(' ', '').ToUpperInvariant() -ne $normalisedReference) {
    throw 'The returned order state does not match the requested payment reference.'
}
if ($OrderId -and $response.order_state.order_id -ne $OrderId) {
    throw 'The returned order state does not match the requested order ID.'
}

Write-Host 'Verified server response:'
$response | ConvertTo-Json -Depth 6
Write-Host "Resulting order state: $($response.order_state.payment_status)"
