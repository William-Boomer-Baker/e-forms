import Head from 'next/head';


import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/header';
import Image from 'next/image';

import Question from '../components/question';
import Answer from '../components/answer';

const ChatgbtP1 = ({ }) => {

  const [result, setResult] = useState({});
  const [inputValue, setInputValue] = useState('')
  const [answers, setAnswers] = useState([]);
  const [qcountstate, setQcountstate] = useState(0);
  const [isLoad, setIsload] = useState(false);


  const textareaRef = useRef(null);
  const qdivRef = useRef(null);

  useEffect(() => {
    setInputValue(localStorage.getItem('inputValue'))
    const storedData = localStorage.getItem('questrionArr');
    const storedArray = JSON.parse(localStorage.getItem('answers'));

    var qcount = localStorage.getItem('qcount');
    if (qcount) {
      setQcountstate(qcount)
    }

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setResult(parsedData.completion);

      if (storedArray && storedArray.length) {
        setAnswers(storedArray)
        if (parsedData.completion && parsedData.completion.length) {
          storedArray.map((item, index) => {
            handleAppendComponent('answer', storedArray[index])
            handleAppendComponent('question', parsedData.completion[index + 1])
          });
        }
      }
    }

  }, [])


  useEffect(() => {
    if (answers && answers.length) {
      localStorage.setItem('answers', JSON.stringify(answers));
      const storedArray2 = JSON.parse(localStorage.getItem('answers'));
      // console.log(storedArray2)

      // Sending to second form
      var qamount = (result && result.length) ? result.length : 0;
      if (storedArray2.length >= qamount) {
        setIsload(true)
        var qa = [];
        var form = {
          "form_name": inputValue,
        }
        if (qamount) {
          for (let i = 0; i < qamount; i++) {
            var tempArr = {
              "question": result[i],
              "answer": answers[i]
            }

            qa = [...qa, tempArr];
          }
          form.qa = qa;
          sendForm(form)
        }

      }
    }
  }, [answers]);

  const sendForm = async (formData) => {
    try {
      const response = await fetch('https://3rpl3gq976.execute-api.us-east-1.amazonaws.com/api/form', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const submitAnswer = () => {
    // Add answer to chat
    const answer = textareaRef.current.value;
    handleAppendComponent('answer', answer)
    setAnswers(prevAnswers => [...prevAnswers, answer]);
    textareaRef.current.value = '';

    // Add question to chat
    var qcount = localStorage.getItem('qcount');
    if (qcount) {
      handleAppendComponent('question', result[++qcount])
      localStorage.setItem('qcount', qcount);
      setQcountstate(qcount)
    }



    // if (result) {
    //   var form = {
    //     "form_name": inputValue,
    //     "qa": [
    //       { "question": "What is your full name", "answer": "jeff boze" },
    //       { "question": "What is your date of birth", "answer": "02/03/1800" },
    //     ]
    //   }
    // }
  }

  const [appendedComponents, setAppendedComponents] = useState([]);

  const handleAppendComponent = (type, content) => {
    if (type == 'question') {
      var componentToAppend = <Question text={content} />;
    }

    if (type == 'answer') {
      var componentToAppend = <Answer text={content} />;
    }

    setAppendedComponents(prevComponents => [...prevComponents, componentToAppend]);
  };

  const scrollToBottom = () => {
    if (qdivRef.current) {
      qdivRef.current.scrollTop = qdivRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom()
  }, [appendedComponents])


  return (

    <div className='background_grey'>
      <Head>
        <title>Payment</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="container max991">
        <div className="text-center mt-5">
          <h3 className="lh-lg">
            {inputValue}
          </h3>
          <p className="lh-lg mb-3">
            We’re going to ask you a series of step by step questions to build
            your agreement.
          </p>
          <p className="lh-lg mb-3">{qcountstate} of {(result && result.length) ? result.length : ''} questions answered
          </p>
        </div>
        <div className="row">
          <div className="col text-center">

            <div className="row row-cols-12 g-4 g-lg-4">
              <div className="col-md-12">
                {isLoad ? (
                  <div className="dark_gray text-white p-4 pe-3 rounded height200 mb-3 position-relative">
                    <p>Please wait while we build your document.</p>
                    <div className="loader-container">
                      <div className="loader"></div>
                    </div>
                  </div>
                ) : (
                  <div className="dark_gray text-white p-4 pe-3 rounded height600 mb-3 position-relative">
                    <div className='qdiv pe-2' ref={qdivRef}>
                      <div className="middle-content-box-section-1  p-3 rounded-3">
                        <div className="row">
                          <div className="col-1">
                            <Image src="/images/chat-symbol-Group.svg" alt="My Image" width={30}
                              height={30} />
                            {/* // <img src="chat-symbol-Group.svg" /> */}
                          </div>
                          <div className="col-11">
                            <p className="text-start">
                              Great! I will guide you through the process of creating a <span dangerouslySetInnerHTML={{ __html: inputValue }} /> by asking you a series of questions.
                              Please provide accurate and detailed information as you respond
                              to the questions. Once we have collected all the necessary
                              information, I'll help you create the lease agreement. Let's
                              start with the first question. {(result && result.length) ? result[0] : ''}?
                            </p>
                          </div>
                        </div>
                      </div>


                      {appendedComponents.map((component, index) => (
                        <div key={index}>{component}</div>
                      ))}
                    </div>


                    <div className="middle-content-box-3 bottom-0 position-absolute tempmargin">
                      <div className='position-relative'>
                        <Image onClick={submitAnswer} className='position-absolute answer_clk' src="/images/icons/Send.png" alt="My Image" width={20}
                          height={20} />
                        <textarea
                          className="form-control pe-5"
                          placeholder="Please type your annswer"
                          id="floatingTextarea"
                          ref={textareaRef}
                        >
                          {/* Please type your annswer */}
                        </textarea>
                      </div>
                    </div>
                  </div>
                )}


              </div>


            </div>



          </div>
        </div>
      </div>

    </div >
  );
};

export default ChatgbtP1;

