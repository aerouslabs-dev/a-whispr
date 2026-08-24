export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/70 py-8 text-center text-sm text-muted-foreground">
      <p>
        A Product by{" "}
        <a
          href="https://aerouslabs.netlify.app"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Aerous Labs
        </a>{" "}
        | All Rights Reserved
      </p>
    </footer>
  );
}
