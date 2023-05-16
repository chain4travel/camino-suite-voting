import React, { useCallback, useMemo } from 'react';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Node,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';
import Box from '@mui/material/Box';
import { Button, Icon, Toolbar } from './Toolbar';
import type { CustomElement } from '../custom-types';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const TextEditor = () => {
  const renderElement = useCallback(
    (
      props: JSX.IntrinsicAttributes & {
        attributes: any;
        children: any;
        element: any;
      }
    ) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (
      props: JSX.IntrinsicAttributes & {
        attributes: any;
        children: any;
        leaf: any;
      }
    ) => <Leaf {...props} />,
    []
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [
        { text: 'This is editable ' },
        { text: 'rich', bold: true },
        { text: ' text, ' },
        { text: 'much', italic: true },
        { text: ' better than a ' },
        { text: '<textarea>', code: true },
        { text: '!' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: "Since it's rich text, you can do things like turn a selection of text ",
        },
        { text: 'bold', bold: true },
        {
          text: ', or add a semantically rendered block quote in the middle of the page, like this:',
        },
      ],
    },
    {
      type: 'block-quote',
      children: [{ text: 'A wise quote.' }],
    },
    {
      type: 'paragraph',
      align: 'center',
      children: [{ text: 'Try it out for yourself!' }],
    },
  ];

  return (
    <Box
      sx={{
        m: 3,
        width: '100%',
        border: 1,
        maxWidth: '50em',
        margin: '20px 5px',
        padding: '20px',
      }}
    >
      <Slate editor={editor} value={initialValue}>
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="code" />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </Slate>
    </Box>
  );
};

type Format =
  | 'block-quote'
  | 'check-list-item'
  | 'editable-void'
  | 'heading'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'numbered-list'
  | 'bulleted-list'
  | 'left'
  | 'center'
  | 'right'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'code';

const toggleBlock = (editor: Editor, format: Format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n: Node) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    } as Partial<SlateElement>;
    console.log('newProperties: ', newProperties);
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block as CustomElement);
  }
};

const toggleMark = (editor: Editor, format: Format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        return (
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format
        );
        // return !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }: { format: Format; icon: string }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={(event: { preventDefault: () => void }) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }: { format: Format; icon: string }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: { preventDefault: () => void }) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default TextEditor;
