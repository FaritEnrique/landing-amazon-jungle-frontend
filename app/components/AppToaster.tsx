"use client";

import { Toaster } from "sonner";

const AppToaster = () => {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      duration={3500}
    />
  );
};

export default AppToaster;
