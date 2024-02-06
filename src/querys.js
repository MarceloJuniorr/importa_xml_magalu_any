import connectionSqldados from "./connection.js";

export const allOrders = async ( ) => {
    const [query] = await connectionSqldados.execute(`
    SELECT
        eord.ordno,
        eord.storeno,
        ordnoweb,
        nfeav.nfkey,
        nfeav.nfno as nota,
        nfeav.serie,
        nfeav.date,
        xml
    FROM
        eord
    INNER JOIN nfeav ON (
        eord.nfno = nfeav.nfno
        AND eord.nfse = nfeav.serie
        AND eord.storeno = nfeav.storeno
    )
    INNER JOIN nfeavxml ON (nfeav.nfkey = nfeavxml.nfkey)
    INNER JOIN eordchannelp ON (
        eord.ordno = eordchannelp.ordno
        AND eord.storeno = eordchannelp.storeno
    )
    WHERE
        eord.date > 20230801
    AND nfeav.date >= 20230801
    AND eord.storeno = 91
    AND eord.s11 = 4
    AND (eord.s9 & POW(2, 6)) = 0
    AND eord.nfno != 0
    AND eord.ordno not in (
        SELECT
            ordno
        FROM
            faturadaAnymarket
        WHERE
            storeno = eord.storeno
    )
GROUP BY
    ordnoweb`
        )
    return query
}

export const insertOrder = async (ordno, storeno ) => {
    const [query] = await connectionSqldados.execute(`
        INSERT INTO faturadaAnymarket (ordno, storeno) values (${ordno}, ${storeno})`)
    return query
}