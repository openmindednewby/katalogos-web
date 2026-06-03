import { useEffect, useState } from 'react';

import { parseRoles } from './UserFormUtils';

export interface InitialValues {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

interface FormState {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  enabled: boolean;
  selectedRoles: string[];
  selectedTenantId: string;
}

interface FormStateSetters {
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPassword: (value: string) => void;
  setEnabled: (value: boolean) => void;
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTenantId: (value: string) => void;
}

type FormStateAndSetters = FormState & FormStateSetters;


function useFormStateValues(initialValues: InitialValues, tenantId: string): [FormState, FormStateSetters] {
  const [username, setUsername] = useState(initialValues.username);
  const [email, setEmail] = useState(initialValues.email);
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber);
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(initialValues.enabled);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialValues.roles);
  const [selectedTenantId, setSelectedTenantId] = useState(tenantId);

  const state: FormState = { username, email, phoneNumber, firstName, lastName, password, enabled, selectedRoles, selectedTenantId };
  const setters: FormStateSetters = { setUsername, setEmail, setPhoneNumber, setFirstName, setLastName, setPassword, setEnabled, setSelectedRoles, setSelectedTenantId };

  return [state, setters];
}

export function useUserFormState(initialValues: InitialValues, tenantId: string): FormStateAndSetters {
  const [state, setters] = useFormStateValues(initialValues, tenantId);
  const { setUsername, setEmail, setPhoneNumber, setFirstName, setLastName, setEnabled, setSelectedRoles } = setters;
  const { username: initUsername, email: initEmail, phoneNumber: initPhone, firstName: initFirst, lastName: initLast, enabled: initEnabled } = initialValues;
  const initialRolesString = JSON.stringify(initialValues.roles);

  useEffect(() => {
    setUsername(initUsername);
    setEmail(initEmail);
    setPhoneNumber(initPhone);
    setFirstName(initFirst);
    setLastName(initLast);
    setEnabled(initEnabled);
    const parsedRoles: unknown = JSON.parse(initialRolesString);
    const fallbackRoles = Array.isArray(parsedRoles) ? parsedRoles.filter((entry): entry is string => typeof entry === 'string') : [];
    setSelectedRoles(parseRoles(parsedRoles, fallbackRoles));
  }, [initUsername, initEmail, initPhone, initFirst, initLast, initEnabled, initialRolesString, setUsername, setEmail, setPhoneNumber, setFirstName, setLastName, setEnabled, setSelectedRoles]);

  return { ...state, ...setters };
}
