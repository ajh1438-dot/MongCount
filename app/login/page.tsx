import { headers } from "next/headers";

import { S8LoginScreen } from "@/components/screens/s8/s8-login-screen";

function getAuthCallbackUrl(host: string | null) {
  if (!host) {
    return "http://127.0.0.1:3000/auth/callback";
  }

  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}/auth/callback`;
}

export default async function LoginPage() {
  const host = (await headers()).get("host");
  return <S8LoginScreen redirectTo={getAuthCallbackUrl(host)} />;
}
