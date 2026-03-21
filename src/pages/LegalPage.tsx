export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
        <div className="mt-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>This is a placeholder page for the {title.toLowerCase()}. Content will be updated with the appropriate legal text.</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            If you have any questions regarding this policy, please contact us at support@ridethetide.info.
          </p>
        </div>
      </div>
    </div>
  );
}
