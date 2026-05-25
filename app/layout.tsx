import type { Metadata } from "next";

const TITLE = "SamPSUng";
const DESCRIPTION = "How much can the Samsung Electronics employees earn from a PSU?";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ padding: "0.5em" }}>
        {children}
      </body>
    </html>
  );
}
