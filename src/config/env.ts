import Environment from '../shared/enums/Environment';

function parseEnvironment(value: unknown): Environment {
  const isValidEnvironment = value === Environment.Dev || value === Environment.Test || value === Environment.Prod;
  if (isValidEnvironment) return value;
  return Environment.Dev;
}

export function getEnvironment(): Environment {
  const processEnv: Record<string, unknown> = process.env;
  const envValue = processEnv.APP_ENV;
  return parseEnvironment(envValue);
}

export const isDevelopment = (): boolean => getEnvironment() === Environment.Dev;
export const isTest = (): boolean => getEnvironment() === Environment.Test;
export const isProduction = (): boolean => getEnvironment() === Environment.Prod;
