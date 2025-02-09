import { FC } from "react"

const Form: FC = ()=>{

  const isValidDateTime = (dateTimeString: string): string | boolean => {
    // Definir las expresiones regulares para cada componente
    const yearRegex = /^\d{4}/;
    const monthRegex = /(0[1-9]|1[0-2])/;
    const dayRegex = /(0[1-9]|[12]\d|3[01])/;
    const hourRegex = /(0[0-9]|1\d|2[0-3])/;
    const minuteSecondRegex = /([0-5]\d)/;

    // Extraer las partes de la cadena
    const parts = dateTimeString.split(" ");
    if (parts.length !== 2) {
        return "Formato incorrecto. Debe contener una fecha y una hora separadas por un espacio.";
    }

    const [datePart, timePart] = parts;
    const dateParts = datePart.split("-");
    const timeParts = timePart.split(":");

    // Verificar formato de fecha (YYYY-MM-DD)
    if (dateParts.length !== 3) {
        return "Formato de fecha incorrecto. Debe ser en el formato YYYY-MM-DD.";
    }

    const [year, month, day] = dateParts;

    if (!yearRegex.test(year)) {
        return "Año inválido. Debe ser un número de cuatro dígitos.";
    }

    if (!monthRegex.test(month)) {
        return "Mes inválido. Debe estar entre 01 y 12.";
    }

    if (!dayRegex.test(day)) {
        return "Día inválido. Debe estar entre 01 y 31, según el mes.";
    }

    // Verificar formato de hora (HH:MM:SS)
    if (timeParts.length !== 3) {
        return "Formato de hora incorrecto. Debe ser en el formato HH:MM:SS.";
    }

    const [hour, minute, second] = timeParts;

    if (!hourRegex.test(hour)) {
        return "Hora inválida. Debe estar entre 00 y 23.";
    }

    if (!minuteSecondRegex.test(minute)) {
        return "Minutos inválidos. Deben estar entre 00 y 59.";
    }

    if (!minuteSecondRegex.test(second)) {
        return "Segundos inválidos. Deben estar entre 00 y 59.";
    }

    // Si todos los componentes son válidos
    return true;
}

// Ejemplo de uso

  return(<div></div>)
}
