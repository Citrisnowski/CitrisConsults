"use client";

import AuthForm from "../../components/AuthForm";
import Container from "../../components/Container";

export default function AuthPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  // default to /subscriptions; only allow same-site relative paths
  const rawNext = searchParams?.next;
  const nextPath =
    typeof rawNext === "string" && rawNext.startsWith("/")
      ? rawNext
      : "/subscriptions";

  return (
    <Container className="py-16">
      <AuthForm nextPath={nextPath} />
    </Container>
  );
}
