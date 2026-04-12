interface PdfPreviewLinkProps {
  href: string;
  label?: string;  // default: "Vaata PDF ↗"
}

export function PdfPreviewLink({ href, label = 'Vaata PDF ↗' }: PdfPreviewLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
