import React, { useState } from 'react';

const PromptBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState([]);
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'string',
    question: '',
    responseType: 'free response',
    options: []
  });
  const [formData, setFormData] = useState({});
  const [resultingPrompt, setResultingPrompt] = useState('');

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.type && newVariable.question) {
      setVariables([...variables, newVariable]);
      setNewVariable({
        name: '',
        type: 'string',
        question: '',
        responseType: 'free response',
        options: []
      });
    }
  };

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = variables.map((variable, i) =>
      i === index ? { ...variable, [field]: value } : variable
    );
    setVariables(updatedVariables);
  };

  const handleAddOption = (index, option) => {
    const updatedVariables = variables.map((variable, i) =>
      i === index ? { ...variable, options: [...variable.options, option] } : variable
    );
    setVariables(updatedVariables);
  };

  const highlightVariablesInPrompt = (text) => {
    let highlightedText = text;
    variables.forEach((variable) => {
      const regex = new RegExp(`%%${variable.name}%%`, 'g');
      highlightedText = highlightedText.replace(
        regex,
        `<span style="background-color: ${
          variable.type === 'string' ? 'lightblue' : 'lightcoral'
        };">%%${variable.name}%%</span>`
      );
    });
    return highlightedText;
  };

  const getPromptStats = () => {
    const words = prompt.trim().split(/\s+/).length;
    const letters = prompt.replace(/\s+/g, '').length;
    const stringVariables = variables.filter(v => v.type === 'string').length;
    const fileVariables = variables.filter(v => v.type === 'file').length;

    return {
      numVariables: variables.length,
      numStringVariables: stringVariables,
      numFileVariables: fileVariables,
      promptLength: prompt.length,
      numWords: words,
      numLetters: letters,
    };
  };

  const renderFormPreview = () => {
    return variables.map((variable, index) => (
      <div key={index}>
        <label>{variable.question}</label>
        {variable.responseType === 'free response' && (
          variable.type === 'string' ? (
            <textarea
              rows="3"
              cols="30"
              placeholder={variable.question}
              value={formData[variable.name] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [variable.name]: e.target.value,
                })
              }
            />
          ) : (
            <input
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [variable.name]: e.target.files[0],
                })
              }
            />
          )
        )}
        {variable.responseType === 'multiple choice' && (
          <select
            onChange={(e) =>
              setFormData({
                ...formData,
                [variable.name]: e.target.value,
              })
            }
          >
            {variable.options.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        {variable.responseType === 'multi choice' && (
          <div>
            {variable.options.map((option, i) => (
              <div key={i}>
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const selectedOptions = formData[variable.name] || [];
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        [variable.name]: [...selectedOptions, option],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        [variable.name]: selectedOptions.filter(
                          (opt) => opt !== option
                        ),
                      });
                    }
                  }}
                />
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const handleSubmit = () => {
    let finalPrompt = prompt;
    variables.forEach((variable) => {
      const regex = new RegExp(`%%${variable.name}%%`, 'g');
      const value = formData[variable.name];
      if (value) {
        if (Array.isArray(value)) {
          finalPrompt = finalPrompt.replace(regex, value.join(', '));
        } else {
          finalPrompt = finalPrompt.replace(regex, value.name || value);
        }
      } else {
        finalPrompt = finalPrompt.replace(regex, '');
      }
    });
    setResultingPrompt(finalPrompt);
  };

  const stats = getPromptStats();

  return (
    <div>
      <h2>Prompt Builder</h2>
      <textarea
        value={prompt}
        onChange={handlePromptChange}
        rows="10"
        cols="50"
        placeholder="Type your prompt here..."
      />
      <h3>Variables</h3>
      <div>
        <input
          type="text"
          value={newVariable.name}
          onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
          placeholder="Variable Name"
        />
        <select
          value={newVariable.type}
          onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value })}
        >
          <option value="string">String</option>
          <option value="file">File</option>
        </select>
        <input
          type="text"
          value={newVariable.question}
          onChange={(e) => setNewVariable({ ...newVariable, question: e.target.value })}
          placeholder="Question"
        />
        <select
          value={newVariable.responseType}
          onChange={(e) => setNewVariable({ ...newVariable, responseType: e.target.value })}
        >
          <option value="free response">Free Response</option>
          <option value="multiple choice">Multiple Choice</option>
          <option value="multi choice">Multi Choice</option>
        </select>
        <button onClick={handleAddVariable}>Add Variable</button>
      </div>
      {variables.map((variable, index) => (
        <div key={index}>
          <input
            type="text"
            value={variable.name}
            onChange={(e) =>
              handleVariableChange(index, 'name', e.target.value)
            }
            placeholder="Variable Name"
          />
          <select
            value={variable.type}
            onChange={(e) =>
              handleVariableChange(index, 'type', e.target.value)
            }
          >
            <option value="string">String</option>
            <option value="file">File</option>
          </select>
          <input
            type="text"
            value={variable.question}
            onChange={(e) =>
              handleVariableChange(index, 'question', e.target.value)
            }
            placeholder="Question"
          />
          <select
            value={variable.responseType}
            onChange={(e) =>
              handleVariableChange(index, 'responseType', e.target.value)
            }
          >
            <option value="free response">Free Response</option>
            <option value="multiple choice">Multiple Choice</option>
            <option value="multi choice">Multi Choice</option>
          </select>
          {(variable.responseType === 'multiple choice' || variable.responseType === 'multi choice') && (
            <div>
              <input
                type="text"
                placeholder="Add Option"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption(index, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <ul>
                {variable.options.map((option, i) => (
                  <li key={i}>{option}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <h3>Preview</h3>
      <div
        dangerouslySetInnerHTML={{
          __html: highlightVariablesInPrompt(prompt),
        }}
      />
      <h3>Stats</h3>
      <div>
        <p>Number of Variables: {stats.numVariables}</p>
        <p>Number of String Variables: {stats.numStringVariables}</p>
        <p>Number of File Variables: {stats.numFileVariables}</p>
        <p>Prompt Length: {stats.promptLength} characters</p>
        <p>Number of Words: {stats.numWords}</p>
        <p>Number of Letters: {stats.numLetters}</p>
      </div>
      <h3>Form Preview</h3>
      <div>{renderFormPreview()}</div>
      <button onClick={handleSubmit}>Submit</button>
      <h3>Resulting Prompt</h3>
      <div>{resultingPrompt}</div>
    </div>
  );
};

export default PromptBuilder;
