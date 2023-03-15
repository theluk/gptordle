import { useUser } from "@/service/user";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

export function withAuth<T extends JSX.IntrinsicAttributes>(
  Component: (props: T) => ReactElement<T>
) {
  const WithAuth = (props: T) => {
    const auth = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!auth.loading && !auth.user) {
        router.push("/");
      }
    }, [router, auth.loading, auth.user]);

    if (auth.loading || !auth.user) return null;

    return <Component {...props} />;
  };

  return WithAuth;
}
