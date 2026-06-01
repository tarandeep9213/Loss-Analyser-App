import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PredefinedQuestions from './PredefinedQuestions';
import ChatArea from './ChatArea';
import GenerateGuidanceReport from './GenerateGuidanceReport';
import SuccessPopup from './SuccessPopup';

export default function ChatBot({ reportId, userId, selectedfaq }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [editingPageReference, setEditingPageReference] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Mock Socket for Demo Mode
    const mockSocket = {
      emit: (event, data) => {
        if (event === 'ask_question') {
          setTimeout(() => {
            const date = new Date();
            const timestamp = date.getTime().toString();
            const answer = `This is a mock AI response to your question: "${data.question}"`;
            addMessage('bot', answer, "Page 1", timestamp);
            setIsLoading(false);
          }, 1000);
        }
      },
      disconnect: () => {}
    };

    setSocket(mockSocket);
    setQuestion(selectedfaq || '');
    loadChatHistory();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedfaq]);

  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addMessage = (role, content, pageReference = '', messageId = null) => {
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const timestamp =
      messageId ||
      `${days[date.getUTCDay()]} ${months[date.getUTCMonth()]} ${date
        .getUTCDate()
        .toString()
        .padStart(2, '0')} ${date.getUTCFullYear()} ${date
        .getUTCHours()
        .toString()
        .padStart(2, '0')}:${date
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      {
        messageId: messageId || generateMessageId(),
        role,
        content,
        pageReference,
        timestamp,
      },
    ]);
    setHasChanges(true);
  };

  const loadChatHistory = async () => {
    try {
      // Mock Chat History
      const response = {
        data: {
          session_id: "mock-session-123",
          chats: {
            "1712000000000": ["What kind of damage was reported?", "The report indicates severe wind and hail damage to the roof.", "Page 2"]
          }
        }
      };

      const { session_id, chats } = response.data;
      const chatHistory = convertChatsToMessages(chats);
      const newSessionId =
        Array.isArray(chats) && chats.length === 0 ? '' : session_id;
      setSessionId(newSessionId);
      setChatHistory(chatHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const convertChatsToMessages = (chats) => {
    const messages = [];
    for (const timestamp in chats) {
      if (timestamp !== 'content') {
        const chatArray = chats[timestamp];
        messages.push({
          messageId: generateMessageId(),
          role: 'user',
          content: chatArray[0],
          timestamp,
        });
        if (chatArray.length > 1) {
          const answer = chatArray[1];
          const pageReference = chatArray[2] || '';
          messages.push({
            messageId: timestamp,
            role: 'bot',
            content: answer,
            pageReference: pageReference,
            timestamp,
          });
        }
      }
    }
    return messages;
  };

  const handleSendQuestion = (questionText = null) => {
    const textToSend = questionText || question;
    if (isLoading) return;
    if (!textToSend.trim()) {
      alert('Please type a message before sending.');
      return;
    }

    if (!reportId || !userId) {
      alert('Please provide both Loss Report ID and User ID.');
      return;
    }

    setIsLoading(true);
    addMessage('user', textToSend);

    if (socket) {
      socket.emit('ask_question', {
        loss_report_id: reportId,
        user_id: userId,
        question: textToSend,
        session_id: sessionId,
      });
    }
    setQuestion('');
  };

  const handleUpdateMessage = async (messageId) => {
    try {
      // Mock Saving API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the message in the UI
      const updateMessageInArray = (prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                content: editingMessageContent,
                pageReference: editingPageReference,
              }
            : msg
        );

      setMessages(updateMessageInArray);
      setChatHistory(updateMessageInArray);
      setEditingMessageIndex(null);
      setEditingMessageContent('');
      setEditingPageReference('');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Chatbot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive AI assistant to help analyze the loss report
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <GenerateGuidanceReport
              reportId={reportId}
              hasChatChanges={hasChanges}
              onError={(error) => {
                console.error('Error generating guidance report:', error);
              }}
            />
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{ display: 'flex', width: '100%', height: 'calc(100vh - 300px)' }}
      >
        <PredefinedQuestions onQuestionSelect={handleSendQuestion} />
        <ChatArea
          messages={messages}
          chatHistory={chatHistory}
          question={question}
          setQuestion={setQuestion}
          handleSendQuestion={handleSendQuestion}
          isLoading={isLoading}
          editingMessageIndex={editingMessageIndex}
          editingMessageContent={editingMessageContent}
          editingPageReference={editingPageReference}
          setEditingMessageIndex={setEditingMessageIndex}
          setEditingMessageContent={setEditingMessageContent}
          setEditingPageReference={setEditingPageReference}
          handleUpdateMessage={handleUpdateMessage}
        />
      </Box>
      <SuccessPopup
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Message updated successfully!"
      />
    </Box>
  );
}
