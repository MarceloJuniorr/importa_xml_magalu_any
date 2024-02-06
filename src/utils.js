export const getDate = () => {
    let data = new Date();
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();
    let dataAtual = ano + mes + dia;

    return dataAtual
}

export const getDatePrior = (days) => {
    let today = new Date();
    let data = new Date(new Date().setDate(today.getDate() - days));
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();
    let dataAnterior = ano + mes + dia;

    return dataAnterior
}

export const formatDate = (date) => {
    // Verifica se a data é um número (formato YYYYMMDD) e converte para string se necessário
    if (typeof date === 'number') {
        // Converte o número para uma string
        date = date.toString();

        // Verifica se a string tem o formato esperado (YYYYMMDD)
        if (date.length === 8) {
            // Formata a string para o formato YYYY-MM-DD
            return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
        }
    }

    // Se a data não for um número ou não estiver no formato esperado, retorna undefined ou ajusta conforme necessário
    return date;
}