export const config = {
    port: process.env.PORT || 3014,
    storeno: process.env.STORENO || "",
    gumgaToken: process.env.GUMGATOKEN || "",
    datePrior: process.env.DATEPRIOR || "30",
    database: {
        host: process.env.DB_HOST || "",
        port: process.env.DB_PORT || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASS || "",
        name: process.env.DB_NAME || "sqldados",
      },
    cron: {
        cronFatura : process.env.CRON_FATURA || '* */5 * * * *'
    }
}