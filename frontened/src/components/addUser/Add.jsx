import { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Add.css';
import toast from 'react-hot-toast';

const Add = () => {
  const initialProblemState = {
    title: '',
    description: '',
    difficulty: 'easy', // default to 'easy'
    testCases: [{ input: '', output: '' }] // start with one test case
  };

  const [problem, setProblem] = useState(initialProblemState);
  const navigate = useNavigate();

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setProblem({ ...problem, [name]: value });
  };

  const testCaseHandler = (index, e) => {
    const { name, value } = e.target;
    const testCases = [...problem.testCases];
    testCases[index][name] = value;
    setProblem({ ...problem, testCases });
  };

  const addTestCase = () => {
    setProblem({ ...problem, testCases: [...problem.testCases, { input: '', output: '' }] });
  };

  const removeTestCase = (index) => {
    const testCases = problem.testCases.filter((_, idx) => idx !== index);
    setProblem({ ...problem, testCases });
  };
  const url_2 = `${import.meta.env.VITE_BACKEND_2_URL}/crud`;
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url_2}/create`, problem);
      toast.success(response.data.msg, { position: 'top-right' });
      navigate('/problems');
    } catch (error) {
      console.log(error);
    }
  };
   const handleBack=()=>{
       navigate("/problems");
   }
  return (
    <div className='addProblem'>
      <button className="backButton" onClick={handleBack}>Back</button>
      <h3>Create New Problem</h3>
      <form className='addProblemForm' onSubmit={submitForm}>
        <div className='inputGroup'>
          <label htmlFor='title'>Problem Title</label>
          <input 
            type='text' 
            onChange={inputHandler} 
            id='title' 
            name='title' 
            autoComplete='off' 
            placeholder='Enter a descriptive title' 
          />
        </div>
        <div className='inputGroup'>
          <label htmlFor='description'>Problem Description</label>
          <textarea 
            onChange={inputHandler} 
            id='description' 
            name='description' 
            autoComplete='off' 
            placeholder='Describe the problem, including any constraints or examples'
          />
        </div>
        <div className='inputGroup'>
          <label htmlFor='difficulty'>Difficulty Level</label>
          <select onChange={inputHandler} id='difficulty' name='difficulty' value={problem.difficulty}>
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </div>
        <div className='inputGroup'>
          <div className='testCasesHeader'>
            <label>Test Cases</label>
            <button type='button' className='addTestCaseBtn' onClick={addTestCase}>Add Test Case</button>
          </div>
          {problem.testCases.map((testCase, index) => (
            <div key={index} className='testCaseGroup'>
              <span className='testCaseNumber'>#{index + 1}</span>
              <input 
                type='text' 
                name='input' 
                value={testCase.input} 
                onChange={(e) => testCaseHandler(index, e)} 
                placeholder='Input (e.g., "5 3" or "[1,2,3]")' 
              />
              <input 
                type='text' 
                name='output' 
                value={testCase.output} 
                onChange={(e) => testCaseHandler(index, e)} 
                placeholder='Expected output' 
              />
              {problem.testCases.length > 1 && (
                <button type='button' onClick={() => removeTestCase(index)}>Remove</button>
              )}
            </div>
          ))}
        </div>
        <button type='submit'>Create Problem</button>
      </form>
    </div>
  );
};

export default Add;
