
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  height = '200px',
  className
}: RichTextEditorProps) {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet', 'link'
  ];

  return (
    <div className={`rich-text-editor ${className || ''}`} style={{ height }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-[200px] mb-12"
      />
    </div>
  );
}
