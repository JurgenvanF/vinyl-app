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
    signUp: string;
    signInInstructions: string;
    signInError: string;
    logout: string;
    helloName: (name: string) => string;
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
    signUp: "Sign Up",
    signInInstructions: "Sign in to your account or create a new one",
    signInError: "Something went wrong during login.",
    logout: "Logout",
    helloName: (name) => `Hello ${name}!`,
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
    signUp: "Registreren",
    signInInstructions: "Log in op uw account of maak een nieuwe aan",
    signInError: "Er is iets misgegaan bij het inloggen.",
    logout: "Uitloggen",
    helloName: (name) => `Hallo ${name}!`,
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
