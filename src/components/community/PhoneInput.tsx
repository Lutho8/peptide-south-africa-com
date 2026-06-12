import { useMemo } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

const PRIORITY: string[] = ["ZA", "US", "GB", "AU", "CA", "DE", "FR", "NL", "AE", "NZ"];

type Props = {
  country: string;
  national: string;
  onChangeCountry: (iso2: string) => void;
  onChangeNational: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
};

export default function PhoneInput({
  country,
  national,
  onChangeCountry,
  onChangeNational,
  disabled,
  error,
}: Props) {
  const countries = useMemo(() => {
    const all = getCountries();
    const priority = PRIORITY.filter((c) => all.includes(c as any));
    const rest = all.filter((c) => !priority.includes(c)).sort();
    return [...priority, ...rest];
  }, []);

  const dial = (iso: string) => {
    try {
      return `+${getCountryCallingCode(iso as any)}`;
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`flex items-stretch gap-0 rounded-lg border ${
        error ? "border-destructive" : "border-input"
      } bg-background focus-within:ring-2 focus-within:ring-ring`}
    >
      <select
        aria-label="Country code"
        value={country}
        onChange={(e) => onChangeCountry(e.target.value)}
        disabled={disabled}
        className="font-mono rounded-l-lg border-r border-input bg-muted/40 px-2 py-3 text-sm text-foreground focus:outline-none"
      >
        {countries.map((c) => (
          <option key={c} value={c}>
            {c} {dial(c)}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="82 123 4567"
        value={national}
        onChange={(e) => onChangeNational(e.target.value.replace(/[^\d\s-]/g, ""))}
        disabled={disabled}
        className="font-mono w-full rounded-r-lg bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}
