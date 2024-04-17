import React from 'react';

const values = [
  { endPoint: 'imageUploader', label: 'Image (PGN, JPEG)' },
  { endPoint: 'svgUploader', label: 'SVG' },
  { endPoint: 'pdfUploader', label: 'PDF' },
  { endPoint: 'ttfFontUploader', label: 'ttf' },
  { endPoint: 'otfFontUploader', label: 'otf' },
  { endPoint: 'epubUploader', label: 'epub' },
  { endPoint: 'mobiUploader', label: 'mobi' },
  { endPoint: 'txtUploader', label: 'txt (plain text)' },
  { endPoint: 'markdownUploader', label: 'MD Markdown' },
  { endPoint: 'jsonUploader', label: 'JSON' },
];
export type EndPointType =
  | 'imageUploader'
  | 'pdfUploader'
  | 'ttfFontUploader'
  | 'otfFontUploader'
  | 'markdownUploader'
  | 'jsonUploader'
  | 'javascriptUploader'
  | 'svgUploader'
  | 'epubUploader'
  | 'mobiUploader'
  | 'txtUploader';

interface ComboboxProps {
  selectedValue: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<EndPointType>>;
}

export function Combobox({ selectedValue, setSelectedValue }: ComboboxProps) {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value as EndPointType);
  };

  return (
    <div>
      <select
        value={selectedValue}
        onChange={handleSelectChange}
        className='p-2 border border-stone-200 rounded-xl'>
        <option value='' disabled hidden>
          Select a file format
        </option>
        {values.map((value) => (
          <option
            key={value.endPoint}
            value={value.endPoint}
            className='p-2 border-b'>
            {value.label}
          </option>
        ))}
      </select>
    </div>
  );
}
