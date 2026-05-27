import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/fotografia/:path*",
    "/entradas/:path*",
    "/gastos/:path*",
    "/compromissos/:path*",
    "/evolucao/:path*",
    "/cartoes/:path*",
  ],
};
