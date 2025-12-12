import React, { useEffect, useRef } from 'react';

interface EditorJsEditorProps {
     value?: string;
     onChange?: (value: string) => void;
     placeholder?: string;
}

const EditorJsEditor: React.FC<EditorJsEditorProps> = ({ value = '', onChange, placeholder }) => {
     const holderRef = useRef<HTMLDivElement | null>(null);
     const editorRef = useRef<any>(null);

     useEffect(() => {
          let mounted = true;

          (async () => {
               const EditorJS = (await import('@editorjs/editorjs')).default;

               if (!mounted) return;

               editorRef.current = new EditorJS({
                    holder: holderRef.current as any,
                    placeholder: placeholder || 'Start typing...',
                    data: value ? { blocks: [{ type: 'paragraph', data: { text: value } }] } : undefined,
                    onChange: async () => {
                         try {
                              const output = await editorRef.current.save();
                              const text = (output.blocks || []).map((b: any) => b.data?.text || '').join('\n\n');
                              onChange?.(text);
                         } catch (err) {
                              // noop
                         }
                    },
               });
          })();

          return () => {
               mounted = false;
               if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                    editorRef.current.destroy();
                    editorRef.current = null;
               }
          };
     }, []);

     return <div ref={holderRef} style={{ minHeight: 200 }} />;
};

export default EditorJsEditor;
