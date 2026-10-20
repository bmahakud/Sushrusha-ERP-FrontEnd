import type { Metadata } from "next";
import { Suspense } from "react";
import StoreSelect from "./StoreSelect";

export const metadata: Metadata = {
  title: "Select a store",
};

export default function SelectStorePage() {
  return (
    <div className="ws-center-page">
      <Suspense fallback={<div className="ws-center-inner" style={{ maxWidth: "30rem" }} aria-busy="true" />}>
        <StoreSelect />
      </Suspense>
    </div>
  );
}
