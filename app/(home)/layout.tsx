import type { ReactNode } from "react";
import "../globals.css";
import RootDocument from "../components/RootDocument";
import { rootMetadata, rootViewport } from "../rootMetadata";

export const metadata = rootMetadata;
export const viewport = rootViewport;

const HomeRootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return <RootDocument lang="en">{children}</RootDocument>;
};

export default HomeRootLayout;
