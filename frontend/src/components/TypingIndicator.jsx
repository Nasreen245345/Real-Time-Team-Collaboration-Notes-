import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0].userName}, ${typingUsers[1].userName}, and ${typingUsers[2].userName} are typing`;
    } else {
      return `${typingUsers[0].userName}, ${typingUsers[1].userName}, and ${typingUsers.length - 2} others are typing`;
    }
  };

  return (
    <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 animate-fadeIn">
      <div className="flex items-center space-x-3"> 
        {/* Typing text */}
        <span className="text-sm text-blue-700 font-medium">
          {getTypingText()}
        </span>

       
      </div>
    </div>
  );
};

export default TypingIndicator;