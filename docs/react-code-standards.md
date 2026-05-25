# Code Standards

[Code Standards](#code-standards)

- [Code Standards](#code-standards)
  - [Client App (React - Front End)](#client-app-react---front-end)
    - [General](#general)
    - [Don't use magic strings use Enums](#dont-use-magic-strings-use-enums)
    - [Dont use the ternary conditional operator ? : in HTML](#dont-use-the-ternary-conditional-operator---in-html)
    - [Naming Conventions](#naming-conventions)
      - [Use PascalCase for](#use-pascalcase-for)
      - [Use camelCase for](#use-camelcase-for)
      - [Specific Naming Patterns](#specific-naming-patterns)
      - [Use UPPERCASE with snake_case for](#use-uppercase-with-snake_case-for)
      - [Standard Naming Conventions](#standard-naming-conventions)
    - [Functions](#functions)
    - [Conditions (if, else, switch)](#conditions-if-else-switch)
      - [Use Early Returns Where Possible](#use-early-returns-where-possible)
      - [Encourage One liner If Cases.](#encourage-one-liner-if-cases)
    - [Folder Structure](#folder-structure)
      - [Views Folder](#views-folder)
    - [Components](#components)
      - [Component Structure Order](#component-structure-order)
      - [Props](#props)
      - [useEffect](#useeffect)
    - [The !](#the-)
      - [example](#example)
    - [Redux](#redux)
    - [Locale](#locale)
    - [Forms](#forms)
      - [How to make a form](#how-to-make-a-form)
        - [FormType and FormFields example](#formtype-and-formfields-example)
        - [getInitialFormState example](#getinitialformstate-example)
        - [buildQueryParameters example](#buildqueryparameters-example)
        - [Form example (index.tsx)](#form-example-indextsx)
    - [Tables](#tables)
      - [How to make a table](#how-to-make-a-table)
      - [How to sort based on the date](#how-to-sort-based-on-the-date)
    - [Styling](#styling)
    - [React Fragment](#react-fragment)
    - [Accessibility](#accessibility)
    - [Error Handling (HTTP API Calls only)](#error-handling-http-api-calls-only)
      - [Considerations](#considerations)
      - [Error Handling Approaches](#error-handling-approaches)
        - [Update HTTP Interceptor Response (Check Body for 200 status code)](#update-http-interceptor-response-check-body-for-200-status-code)
    - [Tanstack Query (How to manage API calls)](#tanstack-query-how-to-manage-api-calls)
      - [POST Example with useMutation](#post-example-with-usemutation)
        - [Service File](#service-file)
        - [Component File](#component-file)
      - [GET Example with useQuery](#get-example-with-usequery)
      - [How to Invalidate Query](#how-to-invalidate-query)
    - [Navigation funciton](#navigation-funciton)
      - [Example Navigation Function](#example-navigation-function)
  - [Unit Testing (Jest)](#unit-testing-jest)
  - [Playwright](#playwright)

## Client App (React - Front End)

### General

- Do not create low level custom shared components. Make use of antDesign as much as possible. Re use components if there are no differences.
  - Only create custom shared component to add additional functionality.
- **fail fast principle** we throw exceptions for anything not handled explicitly instead of hiding the bugs
- **SOLID**
  - Each function should have 1 purpose
- **YAGNI**
- **KISS**
- **DRY**
  - if it is duplicated 2-3 times its ok, its at the discretion of the developer to refactor and make it shared. If it is dublicated more than 3 times it must be refactored and shared
- Each component should have/do one single responsibility/ semantic meaning. If a file gets too large its a warning sign that the single responsibility principle is violated
- Avoid prop drilling. For complicated components, prefer to move state to redux instead of passing state through multiple props
- Prefer to minimize passing custom props to avoid dependencies, hence, copying and passing React components work as they are.
- Avoid writing comments, do not write comments, instead make the the code clean and self explanatory
- **do not use prefix or post fix or abbreviations, use whole words (e.g. use NameFilter instead of NameFilt).**
- Define functions return type if its not void/undefined!! **Especially when they are public**
- Make use of **isValueDefined** to check for null and undefined cases!
- Break complex functionality/components into smaller ones.
  - **Files should not be more than 300 lines, around 100-200 lines is acceptable**
- use react function components not class components
- Keep consistency in the creation of the tables (there is a specific way to we create and structure a table) or for any other component. Follow the same approach as other components in the code base and keep the code base structured and consistent.

### Don't use magic strings use Enums

Magic strings are hard-coded string values used directly in logic without:

- central definition,
- validation,
- auto-completion,
- or type–safety.
  They make code harder to maintain, refactor, and debug.

**avoid**

```ts
if (linkType === "Ticket") {
  //...
} else if (linkType === "Article") {
  //...
}
```

**do**

```ts
enum LinkType {
  Ticket = "Ticket",
  Article = "Article",
}

if (linkType === "Ticket") {
  //...
} else if (linkType === "Article") {
  //...
}
```

### Dont use the ternary conditional operator ? : in HTML

Only use the ternary conditional operator ? : in HTML if it is a small one liner. In general avoid its usage

**avoid**

```tsx
{
  isNotEmptyArray(relatedLinks) ? (
    relatedLinks.map((link) => (
      <Link
        key={`${link.linkType}-${link.linkId}`}
        link={link}
        onDelete={handleDeleteLink}
      />
    ))
  ) : (
    <DTText type="secondary">
      {FM("knowledgeBase.ticket.noRelatedLinks")}
    </DTText>
  );
}
```

**do**

```tsx
{
  isNotEmptyArray(relatedLinks) &&
    relatedLinks.map((link) => (
      <Link
        key={`${link.linkType}-${link.linkId}`}
        link={link}
        onDelete={handleDeleteLink}
      />
    ));
}
{
  !isNotEmptyArray(relatedLinks) && (
    <DTText type="secondary">
      {FM("knowledgeBase.ticket.noRelatedLinks")}
    </DTText>
  );
}
```

### Naming Conventions

- **Interfaces**
  - Interface names are with pascal case
  - Interface fields are with camel case
    - Unless we are mapping the interface to an object we receive from the API
- Variables are with camel case
- React Functions are with pascal case
- Normal functions are with camel case
- use the function key word instead of () => when declaring normal functions
  - If its one liner function use arrow () =>

#### Use PascalCase for

- Components
- Type definitions
- Enums
- Interfaces
- Component folders and directories (e.g. DocumentDetails/index.tsx)
- All other folders use camelCase
- Name parent components files as index.tsx inside directories with the component names

#### Use camelCase for

- Variables
- Functions
- Methods
- Hooks
- Properties
- Props

#### Specific Naming Patterns

- Prefix event handlers with 'handle': handleClick, handleSubmit
- Prefix boolean variables with verbs: isLoading, hasError, canSubmit
- Prefix custom hooks with 'use': useAuth, useForm
- Use complete words over abbreviations except for:
  - props (properties) (All component Props have an interface named Props)
  - FM (Format Message specific function used for localization translation)
  - FD (Format Date specific function used for date localization translation)

#### Use UPPERCASE with snake_case for

- Environment variables (e.g. VITE_HTTP_TIMEOUT_SECONDS=120)

#### Standard Naming Conventions

- **onClick** action is named onClick (unless there is more than 1 onClick in which we add a PostFix _onClickCountry_)
- **onChange** action is named onChange (unless there is more than 1 onClick in which we add a PostFix _onClickCountry_)

### Functions

- Function names are with camel case
- Use the function key word for function declarations (takes advantage of hopping)
  - You should use anonymous (arrow functions) only where necessary such as map operations.
  - You may also use anonymous function in one liner functions (keeping in mind that hopping is not available for arrow function)
- Defined the return type of function unless type is **void** or **undefined**.
- should do only 1 thing and do it well (single responsibility)single responsibility principle
- **Functions should not be more than 30 lines, around 10-20 lines is acceptable (there are exceptions, example 1 switch case of 20 cases)**
- Event functions should be named with a “handle” prefix, like “handleClick” for onClick and “handleKeyDown” for onKeyDown

### Conditions (if, else, switch)

- if more than 2 _if_ statements are used, use a switch statement if possible
- throw exception when unexpected/not-covert value/case is returned instead of hiding it with a default value (**fail fast principle**)
- if a condition is more than 3 statements, create a constant or function and name it appropriately
  - eg:

```ts
const shouldUpdateDeliveryAddress =
      isValueDefined(contactAddress) &&
      isValueDefined(deliveryAddress) &&
      value === SameAsContactAddress.SameAsContactAddress;

      if (shouldUpdateDeliveryAddress) {
```

#### Use Early Returns Where Possible

- Use early returns whenever possible to make the code more readable.

```ts
//Do this
useEffect(() => {
  if (!isValueDefined(value)) return;

  //...the rest of the logic
}, []);

//Don't do this
useEffect(() => {
  if (isValueDefined(value)) {
    //...the rest of the logic
  }

  return;
}, []);
```

#### Encourage One liner If Cases.

```ts
//avoid this
if (submissionId) {
  dispatch(getDocumentTypes(submissionId));
} else {
  dispatch(getDocumentTypes());
}

//prefer this
if (!isValueDefined(submissionId)) dispatch(getDocumentTypes(submissionId));
if (isValueDefined(submissionId)) dispatch(getDocumentTypes());
```

### Folder Structure

#### Views Folder

- all of the private pages are placed under Views folder in a hierarchy manner. (sun tjun the art of war - managing many is the same as managing few, its just a matter of division)

### Components

#### Component Structure Order

1. **global state** (useAppDispatch, useAppSelector)
2. **Tanstack query hooks** useBlaBlaBla
3. **local state** (useState)
4. **any other hook** like useLocal, useNavigate
5. **define constant variables** from the hooks above
6. **useEffect** hook with logic
7. **function definitions** (onClick, onChange)
8. **Conditional Logic With Return Statement** `(if (!user?.profileResponse || !roleIsAuthorized) return <Navigate to="/login" />;)`

```tsx
const UpdateCase = memo(() => {
  const app = useAppSelector((state: RootState) => state.app);
  const layout = useAppSelector((state: RootState) => state.layout);
  const app = useAppSelector((state: RootState) => state.app);

  const { data, isSuccess, isLoading, refetch } =
    useGetJurisdictionOptions(courtId);
  const { data: availableJurisdictions } =
    useGetManageSystemAvailableJurisdictions(courtId!);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const containerStyle = useCustomContainerStyle();
  const lawFirmId = getSelectedLawFirmId(layout.selectedLawFirmId);
  const [form] = DTForm.useForm<FormType>();
  const watchDistrictField = DTForm.useWatch(FormFields.DistrictField, form);

  useEffect(() => {
    //...the rest of the logic
  }, []);

  async function onFinish(value: FormType) {
    //...the rest of the logic
  }
  return <></>;
});
```

#### Props

- Always create a private interface named **Props** for props passed to the component
- Avoid _prop dirlling_. If we need to pass a prop through multiple layers/components (more than 1 - max 2 components) using props is not ideal, consider moving the state to redux.

**Example**

```tsx

interface Props {
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}
const ScaleFiled = ({ value, setValue }: Props) => {
```

#### useEffect

- use **getAsync** or **postAsync** etc in all useEffect hooks that require to wrap inside a function the async function

```tsx
useEffect(() => {
  async function getAsync(): Promise<void> {
    const response = await getReferalStatus(caseDetails!.Id);
    setAlreadyRefered(response.data === 1);
  }
  getAsync();
}, [caseDetails!.Id]);
```

### The !

- Use the **!** in cases where typescript type checking is wrong but with care
- prefer adding on top of the file the /_eslint-disable @typescript-eslint/no-non-null-assertion_/ instead of inline

#### example

```typescript
/* eslint-disable @typescript-eslint/no-non-null-assertion */
useEffect(() => {
  async function getAsync(): Promise<void> {
    const response = await getLawFirmLawyers(selectedLawFirm!.Id);
    setLawyers([...response.data.Items]);
  }

  if (isValueDefined(selectedLawFirm?.Id)) getAsync();
}, [selectedLawFirm]);
```

### Redux

- do not store everything (limit 5mb) for whole app
- do not store binary files
- store shared

### Locale

- Use `intl.formattedMessage` where possible instead of `FM` as it supports passing parameters to locales
- Use `FM` in specific places outside of component and hooks! See example below!

```tsx
const options: CheckboxGroupProps<DistrictFiledEnum>["options"] = [
  {
    label: FM("common.field.district.nicosia"),
    value: DistrictFiledEnum.Nicosia,
  },
  {
    label: FM("common.field.district.limassol"),
    value: DistrictFiledEnum.Limassol,
  },
  {
    label: FM("common.field.district.larnaca"),
    value: DistrictFiledEnum.Larnaca,
  },
  {
    label: FM("common.field.district.famagusta"),
    value: DistrictFiledEnum.Famagusta,
  },
  {
    label: FM("common.field.district.kyrenia"),
    value: DistrictFiledEnum.Kyrenia,
  },
  {
    label: FM("common.field.district.paphos"),
    value: DistrictFiledEnum.Paphos,
  },
];

const DistrictField = memo(({ value, onChange }: Props) => {
  const app = useAppSelector((state: RootState) => state.app);

  function handleSelection(e: RadioChangeEvent) {
    if (onChange) {
      onChange(e.target.value);
    }
  }

  return (
    <>
      {
        <DTRadio.Group
          size={app.radioSize}
          value={value}
          onChange={handleSelection}
          style={{ width: 720 }}
          options={options}
        />
      }
    </>
  );
});
```

### Forms

- Do not bind redux global storage as form values as it causes performance issues (event on every character)
- **Custom components need to implement value and onChange props to work with antD forms and need to be direct children of Form.Item**

#### How to make a form

- see component **NoticeBoardLawyerFormSection** as an example

break the form in the following files

- import type { FormType } from './formType';
- import { FormFields } from './formType';
- './getInitialFormState';
- './buildQueryParameters';
- index.tsx -> for NoticeBoardLawyerFormSection witch contains the form

##### FormType and FormFields example

```tsx
export enum FormFields {
  DistrictField = "districtField", //Επαρχία
  CourtField = "courtField", //Δικαστήριο
  JurisdictionField = "jurisdictionField", //Δικαιοδοσία *
  RegistryField = "registryField", // Μητρώο *
  CaseNumberField = "CaseNumberField", //Αριθμός υπόθεσης
  JudgeField = "JudgeField", //Δικαστής
  ShowMyCases = "ShowMyCases", //Έφεση
  FromDateField = "FromDateField", //Από
  ToDateField = "ToDateField", //Μέχρι
}

export interface FormType {
  [FormFields.DistrictField]: DistrictFiledEnum | undefined;
  [FormFields.CourtField]: CourtIds | string | undefined;
  [FormFields.JurisdictionField]: number | undefined;
  [FormFields.RegistryField]: number | undefined;
  [FormFields.CaseNumberField]: string | undefined;
  [FormFields.JudgeField]: string | undefined;
  [FormFields.ShowMyCases]: boolean;
  [FormFields.FromDateField]: dayjs.Dayjs | undefined;
  [FormFields.ToDateField]: dayjs.Dayjs | undefined;
}
```

##### getInitialFormState example

```tsx
export function getInitialFormState(): FormType {
  return {
    [FormFields.DistrictField]: undefined,
    [FormFields.CourtField]: undefined,
    [FormFields.JurisdictionField]: undefined,
    [FormFields.RegistryField]: undefined,
    [FormFields.CaseNumberField]: undefined,
    [FormFields.JudgeField]: undefined,
    [FormFields.ShowMyCases]: false,
    [FormFields.FromDateField]: dayjs().startOf("day"),
    [FormFields.ToDateField]: dayjs().endOf("month"),
  };
}
```

##### buildQueryParameters example

```tsx
export function buildQueryParameters(
  value: FormType,
  lawFirmId: string | -1,
  UserCode: string
): QueryParameters {
  const DateFrom: string | undefined =
    value.FromDateField!.format("DD/MM/YYYY");
  const DateTo: string | undefined = value.ToDateField!.format("DD/MM/YYYY");

  const queryParameters: QueryParameters = {
    CourtId: value.courtField!,
    JurisdictionId: value.jurisdictionField!,
    Processid: value.registryField!,
    CaseNumber: value.CaseNumberField ?? "",
    JudgeId: value.JudgeField ?? "",
    DateFrom,
    DateTo,
    UserCode,
    OrganisationCode: lawFirmId.toString(), //this is always -1 for some reason JIMTODO to check this with another user
    ShowMyCases: mapBooleanToNumber(value.ShowMyCases ?? false),
  };
  return queryParameters;
}
```

##### Form example (index.tsx)

```tsx
const NoticeBoardLawyerFormSection = memo(
  ({ setTableRows, setTableRowsByDate }: Props) => {
    const app = useAppSelector((state: RootState) => state.app);
    const layout = useAppSelector((state: RootState) => state.layout);
    const user = useAppSelector((state: RootState) => state.user);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [judges, setJudges] = useState<Judge[]>();

    const containerStyle = useCustomContainerStyle();
    const [form] = DTForm.useForm<FormType>();

    const watchDistrictField = DTForm.useWatch(FormFields.DistrictField, form);
    const watchCourtField = DTForm.useWatch(FormFields.CourtField, form);
    const watchJurisdictionField = DTForm.useWatch(
      FormFields.JurisdictionField,
      form
    );
    const watchRegistryField = DTForm.useWatch(FormFields.RegistryField, form);

    const lawFirmId = getSelectedLawFirmId(layout.selectedLawFirmId);

    useEffect(() => {
      form.setFieldsValue(getInitialFormState());
    }, []);

    async function onFinish(value: FormType) {
      setIsSubmitting(true);
      const queryParameters: QueryParameters = buildQueryParameters(
        value,
        lawFirmId,
        user.profileResponse!.Id
      );
      const response = await getLawyerCalendarMeetings(queryParameters);
      const mappedResponse = mapResponse(response.data.Items);
      const groupedRowsByDate = getGroupedRowsByDate(mappedResponse);
      setTableRows(mappedResponse.rows);
      setTableRowsByDate(groupedRowsByDate);
      setIsSubmitting(false);
    }

    function onReset(): void {
      form.resetFields();
    }

    return (
      <>
        <div style={containerStyle}>
          <DTForm<FormType>
            form={form}
            layout={"vertical"}
            initialValues={{ layout: "vertical" }}
            className="table-demo-control-bar"
            onValuesChange={(_form) => {}}
            size="middle"
            style={{ marginBottom: 16 }}
            onFinish={onFinish}
            onReset={onReset}
          >
            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.DistrictField}
                rules={[buildSimpleFormFieldRule("common.field.district")]}
                label={FM("common.field.district")}
              >
                <DistrictField />
              </DTForm.Item>
            </DTFlex>

            <DTFlex
              wrap
              gap="small"
              justify="flex-start"
              align="flex-start"
              style={{ marginBottom: 8 }}
            >
              <DTForm.Item<FormType>
                name={FormFields.CourtField}
                rules={[buildSimpleFormFieldRule("common.field.court")]}
                label={FM("common.field.court")}
              >
                <CourtField district={watchDistrictField} />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.JurisdictionField}
                rules={[buildSimpleFormFieldRule("common.field.jurisdiction")]}
                label={FM("common.field.jurisdiction")}
              >
                <JurisdictionField
                  courtId={watchCourtField}
                  mode={JurisdictionFieldFetchMode.DoNotIncludeUserCode}
                />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.RegistryField}
                rules={[buildSimpleFormFieldRule("common.field.registry")]}
                label={FM("common.field.registry")}
              >
                <RegistryField
                  courtId={watchCourtField}
                  jurisdictionCode={watchJurisdictionField?.toString()}
                  mode={RegistryFieldFetchMode.IncludeIsOpening}
                  isOpening={false}
                />
              </DTForm.Item>
            </DTFlex>

            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.CaseNumberField}
                label={FM("common.field.caseNumber")}
              >
                <DTInput
                  style={{ minWidth: 270 }}
                  placeholder={FM("common.field.caseNumber")}
                  allowClear
                />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.JudgeField}
                label={FM("common.field.judge")}
              >
                <JudgesField
                  courtId={watchCourtField}
                  jurisdictionCode={watchJurisdictionField?.toString()}
                  registryCode={watchRegistryField?.toString()}
                  setItemsExternally={setJudges}
                  allowClear={true}
                />
              </DTForm.Item>

              <div style={{ minWidth: 287 }}>
                <DTForm.Item<FormType>
                  name={FormFields.ShowMyCases}
                  valuePropName="checked"
                  label={" "}
                >
                  <DTCheckbox>{FM("noticeBoard.myCases")}</DTCheckbox>
                </DTForm.Item>
              </div>
            </DTFlex>

            <DTDivider />
            <DTTitle level={2}>{FM("search.case.submissionDate")}</DTTitle>

            <DTFlex wrap gap="small" justify="flex-start" align="flex-start">
              <DTForm.Item<FormType>
                name={FormFields.FromDateField}
                label={FM("common.form.date.from")}
                rules={[buildSimpleFormFieldRule("common.form.date.from")]}
              >
                <DTDatePicker {...datePickerDefaultProps} />
              </DTForm.Item>

              <DTForm.Item<FormType>
                name={FormFields.ToDateField}
                label={FM("common.form.date.to")}
                rules={[buildSimpleFormFieldRule("common.form.date.to")]}
              >
                <DTDatePicker {...datePickerDefaultProps} />
              </DTForm.Item>
            </DTFlex>
            <DTFlex wrap gap="small" justify="flex-end" align="flex-start">
              <DTForm.Item<FormType> label={null}>
                <DTButton
                  style={{ marginTop: "30px" }}
                  htmlType="button"
                  onClick={onReset}
                >
                  {FM("common.action.clear")}
                </DTButton>
              </DTForm.Item>

              <DTForm.Item<FormType> label={null}>
                <DTButton
                  size={app.buttonSize}
                  loading={isSubmitting}
                  style={{ marginTop: "30px" }}
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                >
                  {FM("common.action.search")}
                </DTButton>
              </DTForm.Item>
            </DTFlex>
          </DTForm>
        </div>
      </>
    );
  }
);

export default NoticeBoardLawyerFormSection;
```

### Tables

#### How to make a table

COMMING SOON!!

#### How to sort based on the date

```tsx
{
  title: FM('common.table.column.date'),
  dataIndex: 'CreationDateString',
  sorter: (a, b) => new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime(),
  sortOrder: "descend",
  filters: filters.CreationDateString,
  onFilter: (value, record) => record.CreationDateString.includes(value as string),
  filterSearch: true,
},
```

### Styling

- Avoid using .less to place styles as in React this are in fact global and not local styles
- Instead for local styles use inline styles ()if they are long extract them into a constant even move them into a different file), All other styles should just be set in antD theme token.
- use antD flex component DTFlex instead of creating custom flex css
- **Avoid added styles in css components as much as possible, in stead just configure properly the antD theme token once and reuse it where possible. In necessary cases you may add a few inline styles.**

### React Fragment

- Always use short had notation of react key fragment `<>` instead of the full text `React.Fragment` unless you need to pass some props
  - For example in some cases it is needed to pass the `key` prop, in that case it is acceptable/preferred to use the `React.Fragment` instead of a div

### Accessibility

- Implement accessibility features on elements. For example, a tag should have a tabindex=“0”, aria-label, on:click, and on:keydown, and similar attributes.

### Error Handling (HTTP API Calls only)

**Use interceptor with helper function for error display, use tanstack for state management, mapping, caching and etc.**

#### Considerations

- Backend does not change the header state code instead returns the error in the response and keeps the status code as 200 (most of time)

```json
//**most common result object**
"Result": {
    "MyCallBack": null,
    "Code": "200",
    "Message": null,
    "ResponseStatus": null,
    "ServerName": null,
    "ServerIp": null
}

//other common response
"MyCallBack": null,
"Code": "200",
"Message": null,
"ResponseStatus": null,
"ServerName": null,
"ServerIp": null

//also some times this is not there
"Ok"
```

#### Error Handling Approaches

- Update interceptor with new helper function to determine if the body of the response is error

##### Update HTTP Interceptor Response (Check Body for 200 status code)

### Tanstack Query (How to manage API calls)

- folder structure ex(`services/caseDocuments/useGetDocumentList.ts`)
  - services/
    - `<featureName>/`
      - interfaces OR shared (if more that interfaces are shared PER FEATURE)
    - shared (for common interfaces and API Calls/HOOKS)

#### POST Example with useMutation

- make use of **isPending**

##### Service File

```ts
//POST
export const useLogin = (
  options?: UseMutationOptions<Result<LoginResponse>, Error, LoginPayload>
): UseMutationResult<Result<LoginResponse>, Error, LoginPayload> => {
  return useMutation({
    mutationFn: login,
    ...options,
  });
};

const login = async (
  loginPayload: LoginPayload
): Promise<Result<LoginResponse>> => {
  return await loginRequest(loginPayload);
};

async function loginRequest(loginPayload: LoginPayload) {
  return await post<LoginPayload, LoginResponse>(
    Endpoints.Login,
    loginPayload,
    false,
    true
  );
}
```

##### Component File

```ts
const { data, isLoading, isSuccess, refetch } = useCourtCodes(
  user.profileResponse?.Id
);

const {
  mutate: login,
  isPending,
  // isError,
  // data,
  // error,
} = useLogin({
  onSuccess: (response) => {
    dispatch(setLoginResponse(response.data));
    const role = mapSystemRolesToRole(response.data.Roles);
    dispatch(setAggregatedRouterRole(role));
    refetch();
  },
  // onError: (error) => {
  //   // form.
  //   console.error('Login failed:', error);
  // },
});

function onSubmit(values: FormType) {
  const payload: LoginPayload = {
    username: values[FormFields.UserName]!,
    password: values[FormFields.Password]!,
  };

  login(payload);
}
```

#### GET Example with useQuery

- make use of **isLoading** not isPending or isFetching

```ts
//in component
const { data, isLoading, isSuccess } = useCourtCodes(user.profileResponse?.Id);

// in service
export const useCourtCodes = (userId: string | undefined) => {
  return useQuery({
    queryKey: [Endpoints.CourtCodes, userId],
    queryFn: async (): Promise<Result<CourtCodesResponse>> =>
      courtCodes(userId!),
    enabled: isValueDefined(userId), // query runs only when truthy
  });
};

const courtCodes = async (
  userId: string
): Promise<Result<CourtCodesResponse>> => {
  return await courtCodesRequest(userId);
};
```

#### How to Invalidate Query

```ts
//Option 1 Use refetch callback
const {
  data: pendingCaseData,
  isLoading,
  isSuccess,
  refetch: refetchPendingCase,
} = useGetPendingCase(lawFirmId);

//Option 2
const queryClient = useQueryClient();
const { data, isLoading, isSuccess } = useGetDocumentNotes(externalId);

function refetchQueries() {
  queryClient.invalidateQueries({
    queryKey: [Endpoints.GetDocumentNotes, externalId],
  });
}
```

### Navigation funciton

- All navigation functions sould be placed in `ClientApp\src\utils\navigationActions`

#### Example Navigation Function

```tsx
export function navigateToDocumentDetails(
  navigate: NavigateFunction<AdditionalState>,
  id: number,
  caseId: number,
  caseName: string
) {
  const additionalStateParams = { Id: caseId, Name: caseName };
  const state: AdditionalState = { id: id, additionalStateParams };

  navigate(`/documents/${id}`, {
    state,
  });
}

//called example
<DTButton
  size={"small"}
  type={"link"}
  onClick={() =>
    navigateToDocumentDetails(navigate, record.id, caseId, caseName)
  }
>
  {record.SubmissionDateString}
</DTButton>;
```

## Unit Testing (Jest)

- Unit tests should focus on public/exported functions (utilities, services, hooks helpers) and treat component internals as implementation details.
- Do not write unit tests that mount and snapshot whole components just to raise coverage; full user flows and component integration are covered via Playwright.

## Playwright

- Test should follow the arrange-act-assert method <https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/>
- Identifires should replaced inside constants
- Tests shoul be written in way to run in all the environments
- `$env:BASE_URL = 'https://192.168.210.105/iJustice'; npx playwright test --debug`
- `$env:BASE_URL = 'https://localhost:5173/iJustice'; npx playwright test caseDetails.spec.ts --headed --repeat-each 5`
- `$env:BASE_URL = 'https://localhost:5173/iJustice'; $env:MODE = 'test'; npx playwright test caseDetails.spec.ts --headed --repeat-each 5`
