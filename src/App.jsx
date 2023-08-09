import { useState, useEffect } from 'react'
import './App.css'
import { MainContainer, ChatContainer , MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const API_KEY = "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";


function App() {

  useEffect(() => {
    const handleScroll = (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [messages, setMessages] = useState([
    {
      message: "Hello I am ChatGPT",
      sender: "ChatGPT",
    }
  ])

  const [typing, setTyping] = useState(false);


  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    }

    const newMessages = [...messages, newMessage]

    setMessages(newMessages);

    setTyping(true);

    await processMessageToChatGPT(newMessages);

  }

  async function processMessageToChatGPT(chatMessages) {

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role="assistant"
      } else {
        role="user"
      }
      return { role: role, content: messageObject.message }
    });

    const systemMessage = {
      role: "system",
      content: "Explain the concepts like you have 10 years of an experience in Java Development. And if user ask question not related to Java Development then reply to user that I am not trained to provide you the answer for this question"
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data.choices[0].message.content);
      setMessages( 
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]
      );
      setTyping(false);
    })
  }

  return (
    <div className='App'>
      <div style={{ position: "relative", height: "100vh", width: "100vw"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList scrollBehavior='smooth' typingIndicator={ typing ? <TypingIndicator content="ChatGPT is typing" /> : null }>
              {messages.map((message, i) => {
                return <Message key={i} model={message} style={{ textAlign: "left", margin: "10px"}}/>
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' style={{ textAlign: "left", margin: "5px"}} onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
