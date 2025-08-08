import { BookBody } from "../reading types";

interface EnableProps {
  accumulatedErrors: Record<string, string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const enable = ({ accumulatedErrors, setDisabled }: EnableProps): void => {
  !Object.keys(accumulatedErrors).length && setDisabled(false);
};

interface ValidateProps {
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const validate = ({
  e,
  errors,
  setErrors,
  setDisabled,
}: ValidateProps): void => {
  let accumulatedErrors = errors;
  if (e.target.value.length === 0 || e.target.value === undefined) {
    let address = e.target.name === "image" ? "address " : "";
    setErrors({
      ...errors,
      [e.target.name]: `${e.target.name} ${address}is empty`,
    });
    setDisabled(true);
    return;
  }
  if (
    e.target.name === "name" &&
    !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/g.test(e.target.value)
  ) {
    setErrors({
      ...errors,
      [e.target.name]: `${e.target.name} must have just letters and spaces`,
    });
    setDisabled(true);
    return;
  }

  if (
    (e.target.name === "total_pages" ||
      e.target.name === "average_of_characters_per_minute" ||
      e.target.name === "current_page") &&
    !Number(e.target.value)
  ) {
    setErrors({
      ...errors,
      [e.target.name]: `${e.target.name} must be an integer number`,
    });
    setDisabled(true);
    return;
  }
  console.log(e.target.name);
  delete accumulatedErrors[e.target.name];
  setErrors({ ...accumulatedErrors });

  enable({ accumulatedErrors, setDisabled });

  // chequear que el name no se repita.
};

export interface HandleChangeProps {
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  book: BookBody;
  setBook: React.Dispatch<React.SetStateAction<BookBody>>;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const handleChange = ({
  e,
  book,
  setBook,
  errors,
  setErrors,
  setDisabled,
}: HandleChangeProps): void => {
  setBook({
    ...book,
    [e.target.name]: e.target.value,
  });

  validate({ e, errors, setErrors, setDisabled });
};

const checkBeforeSubmit = (
  errors: Record<string, string | undefined>,
  book: BookBody,
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >,
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>
): boolean => {
  if (book.name === "") {
    setErrors({
      ...errors,
      name: "Name is empty",
    });
    setDisabled(true);
    return false;
  } else if (book.image === "") {
    setErrors({
      ...errors,
      habit_type: "Habit type is book",
    });
    setDisabled(true);
    return false;
  } else if (book.total_pages === 0) {
    setErrors({
      ...errors,
      habit_type: "total page is empty",
    });
    setDisabled(true);
    return false;
  }
  setDisabled(false);
  return true;
};
export { handleChange, checkBeforeSubmit };
