/** Status of the auto-save operation. */
const enum SaveStatus {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}

export default SaveStatus;
