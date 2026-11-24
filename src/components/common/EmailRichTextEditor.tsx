import React from 'react';
import { RichTextEditor } from './RichTextEditor';

// Compatibility wrapper: all editor behavior lives in the shared component.
export const EmailRichTextEditor = (props: React.ComponentProps<typeof RichTextEditor>) => (
  <RichTextEditor {...props} label={props.label ?? 'Email message'} />
);
