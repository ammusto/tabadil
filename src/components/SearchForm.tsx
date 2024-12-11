import React, { useState, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext';
import SearchInput from './SearchInput';
import './SearchForm.css';
import InfoTooltip from './InfoTooltip';

interface SearchFormProps {
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  formId: string;
  isFirstForm: boolean;
  onRemove: () => void;
  onAdd: () => void;
  canAdd: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  formId,
  onAdd,
  canAdd,
  onRemove
}) => {
  const {
    searchParams,
    updateFormParams,
  } = useSearch();

  const formParams = searchParams.forms.find(f => f.formId === formId) || searchParams.forms[0];

  const [kunyas, setKunyas] = useState<string[]>(
    formParams.kunyas.length > 0 ? formParams.kunyas : ['']
  );
  const [nasab, setNasab] = useState(formParams.nasab);
  const [nisbas, setNisbas] = useState<string[]>(
    formParams.nisbas.length > 0 ? formParams.nisbas : ['']
  );
  const [allowRareKunyaNisba, setAllowRareKunyaNisba] = useState(formParams.allowRareKunyaNisba);
  const [allowTwoNasab, setAllowTwoNasab] = useState(formParams.allowTwoNasab);
  const [allowKunyaNasab, setAllowKunyaNasab] = useState(formParams.allowKunyaNasab);
  const [allowOneNasabNisba, setAllowOneNasabNisba] = useState(formParams.allowOneNasabNisba);
  const [allowOneNasab, setAllowOneNasab] = useState(formParams.allowOneNasab);

  const [allowSingleField, setAllowSingleField] = useState(formParams.allowSingleField);
  const tooltips = {
    kunya: "Enter the kunya or laqab, e.g. أبو منصور or قوام السنة",
    nasab: "Enter nasab with at least two names, e.g. معمر بن أحمد",
    nisba: "Enter a nisba, e.g. الأصبهاني"
  };

  // Update form data on any change
  const updateFormData = useCallback(() => {
    updateFormParams(formId, {
      kunyas: kunyas.filter(Boolean),
      nasab,
      nisbas: nisbas.filter(Boolean),
      allowRareKunyaNisba,
      allowTwoNasab,
      allowKunyaNasab,
      allowOneNasabNisba,
      allowOneNasab,
      allowSingleField
    });
  }, [
    formId,
    kunyas,
    nasab,
    nisbas,
    allowRareKunyaNisba,
    allowTwoNasab,
    allowKunyaNasab,
    allowOneNasabNisba,
    allowOneNasab,
    allowSingleField,
    updateFormParams
  ]);

  // Update form data whenever any field changes
  React.useEffect(() => {
    updateFormData();
  }, [
    kunyas,
    nasab,
    nisbas,
    allowRareKunyaNisba,
    allowTwoNasab,
    allowKunyaNasab,
    allowOneNasabNisba,
    allowOneNasab,
    allowSingleField,
    updateFormData
  ]);

  const addKunya = useCallback(() => {
    if (kunyas.length < 2) {
      setKunyas(prev => [...prev, '']);
    }
  }, [kunyas.length]);

  const updateKunya = useCallback((index: number, value: string) => {
    setKunyas(prev => prev.map((k, i) => i === index ? value : k));
  }, []);

  const removeKunya = useCallback((index: number) => {
    setKunyas(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addNisba = useCallback(() => {
    setNisbas(prev => [...prev, '']);
  }, []);

  const updateNisba = useCallback((index: number, value: string) => {
    setNisbas(prev => prev.map((n, i) => i === index ? value : n));
  }, []);

  const removeNisba = useCallback((index: number) => {
    setNisbas(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetForm = useCallback(() => {
    setKunyas(['']);
    setNasab('');
    setNisbas(['']);
    setAllowRareKunyaNisba(false);
    setAllowTwoNasab(false);
    setAllowKunyaNasab(false);
    setAllowOneNasabNisba(false);
    setAllowOneNasab(false);
    setAllowSingleField(false);
  }, []);

  return (

    <div className='search-form-container'>

      <div className="input-group">
        {kunyas.map((kunya, index) => (
          <div key={index} className="kunya-input">
            <SearchInput
              value={kunya}
              onChange={(value) => updateKunya(index, value)}
              placeholder='كنية/لقب'
              tooltip={index === 0 ? tooltips.kunya : undefined}
              dir="rtl"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeKunya(index)}
                className="remove-kunya"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {kunyas.length < 2 && (
          <button type="button" onClick={addKunya} className="add-kunya">
            Add Laqab
          </button>
        )}
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={allowRareKunyaNisba}
              onChange={(e) => setAllowRareKunyaNisba(e.target.checked)}
            />
            Include kunya + nisba
          </label>
          <InfoTooltip content="This will include a search for just the kunya and nisba, e.g. أبو منصور الأصبهاني" />
        </div>
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={allowKunyaNasab}
              onChange={(e) => setAllowKunyaNasab(e.target.checked)}
            />
            Include kunya + 1st nasab
          </label>
          <InfoTooltip content="This will include a search for just the kunya and first name in the nasab, e.g. أبو محمد أحمد" />
        </div>
      </div>

      <div className="input-group">
        <SearchInput
          value={nasab}
          onChange={setNasab}
          placeholder="نَسَب"
          tooltip={tooltips.nasab}
          dir="rtl"
        />
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={allowOneNasab}
              onChange={(e) => setAllowOneNasab(e.target.checked)}
            />
            Include 1-part nasab
          </label>
          <InfoTooltip content="This will include a search for just the first name in the nasab, e.g. محمد" />
        </div>
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={allowOneNasabNisba}
              onChange={(e) => setAllowOneNasabNisba(e.target.checked)}
            />
            Include 1-part nasab + nisba
          </label>
          <InfoTooltip content="This will include a search for just the first name in the nasab and the nisba, e.g. محمد الدمشقي" />
        </div>
        <div className="form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={allowTwoNasab}
              onChange={(e) => setAllowTwoNasab(e.target.checked)}
            />
            Include 2-part nasab
          </label>
          <InfoTooltip content="This will include a search for just the two first names in the nasab, e.g. محمد بن أحمد" />
        </div>
      </div>

      <div className="input-group">
        {nisbas.map((nisba, index) => (
          <div key={index} className="nisba-input">
            <SearchInput
              value={nisba}
              onChange={(value) => updateNisba(index, value)}
              placeholder='نسبة'
              tooltip={index === 0 ? tooltips.nisba : undefined}
              dir="rtl"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeNisba(index)}
                className="remove-nisba"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addNisba} className="add-nisba">
          Add Nisba
        </button>
      </div>


      <div className="form-buttons">
        <button
          type="button"
          onClick={resetForm}
          className="reset-form-button"
        >
          Reset Form
        </button>
          <button
            type="button"
            onClick={onAdd}
            className="add-form-button"
            disabled={!canAdd}
          >
            Add Name
          </button>


        {formId !== 'form-0' && (
          <button
            type="button"
            onClick={onRemove}
            className="remove-form-button"
          >
            Delete Name
          </button>
        )}
      </div>
    </div >

  );
};

// const validateInputs = (form: Omit<FormSearchParams, 'formId'>): boolean => {
//   const hasKunya = form.kunyas.some(kunya => kunya.trim().length > 0);
//   const hasNasab = form.nasab.trim().length > 0;
//   const hasNisba = form.nisbas.some(nisba => nisba.trim().length > 0);

//   if (form.allowRareKunyaNisba && form.allowTwoNasab && hasKunya && hasNisba && form.allowKunyaNasab && form.allowOneNasabNisba) {
//     return true;
//   }

//   const filledInputs = [hasKunya, hasNasab, hasNisba].filter(Boolean).length;
//   return filledInputs >= 2;
// };

export default SearchForm;