import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { resetCustomerProfileCache } from "../src/hooks/useCustomerProfile";

afterEach(() => {
    cleanup();
    resetCustomerProfileCache();
});
