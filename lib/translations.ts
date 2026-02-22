type Locale = "en" | "nl";

type Translations = {
  [key in Locale]: {
    welcome: string;
    login: string;
    register: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    signUp: string;
    signInError: string;
    logout: string;
    helloName: (name: string) => string;
    yourUsername: string;
    loading: string;
    profileLoadError: string;
  };
};

export const translations: Translations = {
  en: {
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    username: "Username",
    signUp: "Sign Up",
    signInError: "Something went wrong during login.",
    logout: "Logout",
    helloName: (name) => `Hello ${name}!`,
    yourUsername: "Your username",
    loading: "Loading...",
    profileLoadError: "Could not load your profile. Please try again.",
  },
  nl: {
    welcome: "Welkom",
    login: "Inloggen",
    register: "Registreren",
    email: "E-mail",
    password: "Wachtwoord",
    firstName: "Voornaam",
    lastName: "Achternaam",
    username: "Gebruikersnaam",
    signUp: "Registreren",
    signInError: "Er is iets misgegaan bij het inloggen.",
    logout: "Uitloggen",
    helloName: (name) => `Hallo ${name}!`,
    yourUsername: "Je gebruikersnaam",
    loading: "Laden...",
    profileLoadError: "Kan je profiel niet laden. Probeer het opnieuw.",
  },
};

export const t = (
  locale: Locale,
  key: keyof Translations["en"],
  ...args: any[]
): string => {
  const value = translations[locale][key];
  if (typeof value === "function")
    return (value as (...args: any[]) => string)(...args);
  return value;
};
