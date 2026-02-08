import React, { useState, useEffect, useRef } from 'react';
import { toast as toastify, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import { ScaleLoader } from 'react-spinners';
import { File, Paperclip, RefreshCcw, X, Expand, Minimize2, Download } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
import ChatLoader from '../components/ChatLoader';
import { MentionsInput, Mention } from 'react-mentions';
import 'react-quill/dist/quill.snow.css';
const socket = getSocket();

export const Chat = ({ quoteId, refId, status, submittedToAdmin, finalFunction, finalfunctionforsocket, allDetails, tlType, handlefullScreenBtnClick, chatTabVisible, fullScreenTab }) => {
    const [messages, setMessages] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [markStatus, setMarkStatus] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [users, setUsers] = useState([]);
    const [mentionStartPosition, setMentionStartPosition] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const userData = localStorage.getItem('user');
    const userObject = JSON.parse(userData);
    const loopUserData = localStorage.getItem('loopuser');
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const loopUserObject = JSON.parse(loopUserData);
    const [mentions, setMentions] = useState([]);
    const [mentionIds, setMentionIds] = useState([]);

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyingOpen, setReplyingOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState(new Set());

    const handleReplyClick = (messageId, message) => {
        // console.log(messageId)
        if (replyingTo == messageId) {
            // If already replying to this message, close the reply box
            setReplyingTo(null);
            setReplyingToMessage(null);
            setReplyingOpen(false);
        } else {
            // Open reply box for new message
            setReplyingTo(messageId);
            setReplyingToMessage(message);
            setReplyText(""); // Clear input
            setReplyingOpen(true);
        }
    };

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
    };

    const handleSendReply = async () => {
        if (replyText.trim() === "") return;

        // console.log("Replying to Message ID:", replyingTo, "Message:", replyText);

        const formData = new FormData();
        formData.append("chat_id", replyingTo); // ID of the chat message being replied to
        formData.append("message", replyText);
        formData.append("user_id", loopUserObject.id);
        formData.append("user_type", userObject.user_type);

        try {
            const response = await fetch("https://loopback-skci.onrender.com/api/scope/submitReply", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.status) {
                const serializedData = {
                    ref_id: refId,
                    quote_id: quoteId,
                    message: replyText,
                    user_id: loopUserObject.id,
                    user_type: userObject.user_type,
                    category: userObject.category,
                };
                setReplyingTo(null);
                setReplyingToMessage(null);
                setReplyingOpen(false);
                setReplyText("");
                const user_name = loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name;
                socket.emit('sendmessage', {
                    quote_id: quoteId,
                    ref_id: refId,
                    user_name: user_name,
                    all_details: allDetails,
                    user_id: loopUserObject.id,
                    formData: serializedData,
                    type: "reply",
                    replyingTo: replyingTo
                })
            } else {
                console.error("Failed to submit reply:", result.error);
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
        } finally {
            fetchMessagesForSocket();
        }
    };


    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getQuoteChatApiNew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quote_id: quoteId, user_id: loopUserObject.id })
            });
            const data = await response.json();
            setMessages(data.data);
            // console.log(data.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchMessagesForSocket = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getQuoteChatApiNew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quote_id: quoteId, user_id: loopUserObject.id })
            });
            const data = await response.json();
            setMessages(data.data);
            // console.log(data.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const formatMessageForSending = (message) => {
        // Replace mentions in the format @[Name](id) with {{{Name,id}}}
        return message.replace(/@\[([^\]]+)\]\((\d+)\)/g, (match, name, id) => {
            return `{{{${name},${id}}}}`;
        });
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) {
            toast.error('Message is required');
            return;
        }

        const formattedMessage = formatMessageForSending(newMessage);

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('quote_id', quoteId);
        formData.append('message', formattedMessage); // Using formatted message
        formData.append('user_id', loopUserObject.id);
        formData.append('user_type', userObject.user_type);
        formData.append('category', userObject.category);
        formData.append('markstatus', markStatus ? '1' : '0');
        formData.append('mention_ids', mentionIds);
        formData.append('mention_users', mentions);
        formData.append('old_status', allDetails.quote_status);
        formData.append('quote', JSON.stringify(allDetails));
        if (file) {
            formData.append('file', file);
        }

        const serializedData = {
            ref_id: refId,
            quote_id: quoteId,
            message: formattedMessage,
            user_id: loopUserObject.id,
            user_type: userObject.user_type,
            category: userObject.category,
            markstatus: markStatus ? '1' : '0',
            mention_ids: mentionIds,
            mention_users: mentions,
            file: null, // or base64 if you really want to send the file via socket
        };

        try {
            setButtonDisabled(true);
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/submituserchatnew', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.status) {
                const user_name = loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name;
                socket.emit('sendmessage', {
                    quote_id: quoteId,
                    ref_id: refId,
                    user_name: user_name,
                    all_details: allDetails,
                    user_id: loopUserObject.id,
                    formData: serializedData,
                    insertedId: data.insertedId ?? 0,
                    type: "message",
                })

                setNewMessage('');
                setFile('');
                setFile(null);
                setFileName('');
                if (markStatus) {

                    finalFunction();
                }
                fetchMessagesForSocket();

            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setButtonDisabled(false);
        }
    };

    useEffect(() => {
        if (quoteId) {
            fetchMessages();
        }

    }, [quoteId]);

    useEffect(() => {
        socket.on('chatresponse', (data) => {
            if (data.quote_id == quoteId && data.ref_id == refId) {
                // console.log("chat response", data)


                const formData = data.formData;
                const user_name = data.user_name || "";

                const nowUnix = Math.floor(Date.now() / 1000); // current datetime in unix seconds

                const newMessage = {
                    message_id: data.insertedId,
                    sender_id: formData.user_id,
                    fld_first_name: user_name,
                    fld_last_name: "", // or extract from somewhere if available
                    message: formData.message,
                    date: nowUnix,
                    isfile: 0,
                    filepath: "",
                    needtoreply: formData.mention_ids ?? null,
                    isdeleted: 0,
                    deleted_user_name: null,
                    replies: [],
                    pending_responses: formData.mention_users
                };

                setMessages(prev => [...prev, newMessage]);

                fetchMessagesForSocket();
                finalfunctionforsocket();
            }
        });

        return () => {
            socket.off('chatresponse');
        };
    }, [quoteId, refId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const clearFile = () => {
        setFile(null);
        setFileName("");
    };

    const handleTextareaChange = (e) => {
        // Remove HTML tags from the value
        const value = e.target.value.replace(/<\/?[^>]+(>|$)/g, "");
        setNewMessage(e.target.value); // Keep the formatted value in state

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const atMatch = textBeforeCursor.match(/@(\w*)$/);

        if (atMatch) {
            // Get cursor position from Quill editor
            const selection = textareaRef.current.getEditor().getSelection();
            if (selection) {
                const bounds = textareaRef.current.getEditor().getBounds(selection.index);
                const editorBounds = textareaRef.current.getEditor().container.getBoundingClientRect();

                setDropdownPosition({
                    top: bounds.top + editorBounds.top - 60,
                    left: bounds.left + 25
                });
            }

            setShowUserDropdown(true);
            setMentionStartPosition(cursorPosition);

            const searchQuery = atMatch[1].toLowerCase();
            const filteredUsers = users.filter(user =>
                user.name.toLowerCase().startsWith(searchQuery) ||
                user.name.toLowerCase().includes(searchQuery)
            );

            setFilteredUsers(filteredUsers);
        } else {
            setShowUserDropdown(false);
        }

        // Use the plain text value for mention detection
        const mentionMatches = value.match(/@(\w+)/g) || [];
        const extractedMentions = mentionMatches.map(mention => mention.substring(1));

        const validMentions = extractedMentions.filter(username =>
            users.some(user => user.name === username)
        );

        const validMentionIds = validMentions.map(username => {
            const matchedUser = users.find(user => user.name === username);
            return matchedUser ? matchedUser.id : null;
        }).filter(id => id !== null);

        setMentions([...new Set(validMentions)]);
        setMentionIds([...new Set(validMentionIds)]);
    };


    const handleUserSelect = (selectedUser) => {
        // Only remove <p> tags, preserve other HTML tags
        const plainValue = newMessage.replace(/<\/?p>/g, '');
        const cursorPosition = mentionStartPosition;

        const textBeforeCursor = plainValue.substring(0, cursorPosition);
        const atMatch = textBeforeCursor.match(/@(\w*)$/);

        if (!atMatch) return;

        const mentionStart = cursorPosition - atMatch[0].length;
        const messageBeforeMention = plainValue.substring(0, mentionStart);
        const messageAfterMention = plainValue.substring(cursorPosition);

        // Construct new message without <p> tags
        const newMessageText = `${messageBeforeMention} <span class="mention" style="background-color: #CAE5FFFF;">@${selectedUser.name}</span> ${messageAfterMention}`;
        setNewMessage(newMessageText);
        setShowUserDropdown(false);

        // Set focus and cursor position after React updates the state
        setTimeout(() => {
            const editor = textareaRef.current.getEditor();
            const newPosition = mentionStart + `@${selectedUser.name} `.length;
            editor.setSelection(newPosition, newPosition);
        }, 0);

        setMentions((prevMentions) => {
            const updatedMentions = [...new Set([...prevMentions, `@${selectedUser.name}`])];
            return updatedMentions;
        });

        setMentionIds((prevMentionIds) => {
            const updatedMentionIds = [...new Set([...prevMentionIds, selectedUser.id])];
            return updatedMentionIds;
        });
    };





    const fetchUsers = async () => {
        setUsers([]);
        const { user_id, feasibility_user, followers, isFeasibility } = allDetails;

        // Determine if feasibility_user should be included
        const feasibilityUser = isFeasibility == 0 ? null : feasibility_user;

        // Construct the user ID array
        const userIds = [
            user_id,
            1,
            feasibilityUser,
            ...(followers ? followers.split(',') : [])
        ].map(id => id ? parseInt(id, 10) : null).filter(id => id !== null && !isNaN(id));

        try {
            const response = await fetch("https://loopback-skci.onrender.com/api/scope/fetchUsersToMention", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user_ids: userIds })
            });

            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.data)) {
                // Extract first names for setting users
                const usersList = data.data.map(user => ({
                    id: user.id,
                    name: user.fld_first_name + " " + user.fld_last_name
                }));
                setUsers(usersList);
            } else {
                console.error("Error fetching users:", data.message);
                setUsers([]);
            }
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return null;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [allDetails])

    useEffect(() => {
        console.log("Mentions:", mentions);
        console.log("mentions:", mentionIds);
        console.log("newMessage:", newMessage);
    }, [mentions, mentionIds, newMessage]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (
            (loopUserObject.fld_email === 'puneet@redmarkediting.com' ||
                loopUserObject.fld_email === 'clientsupport@chankyaresearch.net') &&
            ((status === 0 && submittedToAdmin === "true") || status === 2)
        ) {
            setMarkStatus(true);
        }
    }, [loopUserObject.fld_email, status, submittedToAdmin]);


    const formatMessage = (message) => {
        return message.replace(/\{\{\{(.*?),(.*?)\}\}\}/g, (match, name, id) => {
            return `<b style="color:#126dff;cursor:pointer;">${name}</b>`;
        });
    };


    const modules = {
        toolbar: [
            // ['bold', 'italic', 'underline'],
            // [{ 'list': 'ordered' }, { 'list': 'bullet' }]
            // ['link'],
            // ['clean']
        ]
    };

    const formats = [
        // 'bold', 'italic', 'underline',
        // 'list', 'bullet',
        // 'link'
    ];

    const mentionsStyles = `
    .mentions-input {
        width: 100%;
    }

    .user-suggestion {
        padding: 5px 15px;
    }

    .user-suggestion.focused {
        background-color: #CAE5FF;
    }
    `;

    return (
        <div className="bg-white w-full">
            <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                <h3 className=""><strong>Communication Hub</strong></h3>
                <div className='flex items-center'>
                    <button
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Refresh"
                        className='btn btn-light btn-sm flex items-center p-1 mr-2' onClick={fetchMessages}>
                        <RefreshCcw size={10} />
                    </button>
                    <button className="" >
                        {fullScreenTab == "chat" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-danger flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("chat") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                    </button>
                </div>
            </div>

            <div className="p-3">
                {loadingMessages ? (
                    <p><ChatLoader /></p>
                ) : (
                    messages && messages.length > 0 && (
                        <div className="chat-container bg-blue-50" id="chatContainer" ref={chatContainerRef}>
                            {messages.map((chatVal, index) => {
                                const isUser = chatVal.sender_id == loopUserObject.id;
                                return (
                                    <div key={index} className={`chat-message ${isUser ? 'right' : ''}`}>
                                        {/* Chat Info */}
                                        <div className="chat-info">
                                            <span className="chat-name">
                                                {chatVal.isdeleted == "1" ? (
                                                    <span style={{ color: "red", textDecoration: "line-through" }}>
                                                        {chatVal.deleted_user_name}
                                                    </span>
                                                ) : (
                                                    chatVal.fld_first_name + " " + chatVal.fld_last_name
                                                )}
                                            </span>
                                            <span className="chat-timestamp">
                                                {new Date(chatVal.date * 1000).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }).replace(',', '')}
                                            </span>

                                        </div>

                                        {/* Chat Text */}
                                        <div
                                            className={`chat-text ${isUser ? 'right' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: formatMessage(chatVal.message) }}
                                        />

                                        {/* File Attachment */}
                                        {chatVal.isfile == "1" && (
                                            <div className="file-container">
                                                {/* <i className="fa fa-file mr-3"></i> */}
                                                <p className="text-sm text-gray-800 truncate w-full">
                                                    {
                                                        (() => {
                                                            const fullName = chatVal.file_path.split('/').pop();
                                                            const maxLength = 35;
                                                            if (fullName.length <= maxLength) return fullName;
                                                            const half = Math.floor((maxLength - 3) / 2);
                                                            return `${fullName.slice(0, half)}...${fullName.slice(-half)}`;
                                                        })()
                                                    }
                                                </p>
                                                <a href={chatVal.file_path} target="_blank" rel="noopener noreferrer" ><Download size={16} /></a>
                                            </div>
                                        )}
                                        {chatVal.pending_responses && chatVal.pending_responses.length > 0 && (
                                            <div className="pending-responses text-red-500 flex space-x-1" style={{ fontSize: "11px" }} >
                                                {chatVal.pending_responses.map((response, index) => (
                                                    <p key={index} className='font-semibold'>{response}</p>
                                                ))} <span className='ml-1'>
                                                    response pending
                                                </span>
                                            </div>
                                        )}


                                        {/* Replies */}
                                        {chatVal.replies && chatVal.replies.length > 0 && (
                                            <div className="reply-container">
                                                {chatVal.replies.map((reply, rIndex) => (
                                                    <div key={rIndex} className={isUser ? "invertlstyle" : ""}>
                                                        <div className={`${isUser ? 'reply-inverted-l-shape' : 'reply-l-shape'}`}></div>
                                                        <div className="reply-message">
                                                            <div className="reply-info">
                                                                <span className="reply-name">{reply.fld_first_name} {reply.fld_last_name}</span>
                                                                <span className="reply-timestamp">
                                                                    {new Date(reply.date * 1000).toLocaleString('en-GB', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    }).replace(',', '')}
                                                                </span>

                                                            </div>
                                                            <div className="reply-text">{reply.message}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply Button */}
                                        <div className="reply-section">
                                            <button className="reply-button" onClick={() => handleReplyClick(chatVal.message_id, chatVal.message)}>
                                                <i className="fa fa-reply"></i>
                                            </button>
                                        </div>

                                        {/* Reply Box */}
                                        {replyingTo == chatVal.message_id && replyingOpen && (
                                            <div className="reply-box">
                                                <p className="text-gray-500 text-xs italic">
                                                    Replying to:{" "}
                                                    <span dangerouslySetInnerHTML={{ __html: formatMessage(replyingToMessage?.substring(0, 60)) + "..." }} />
                                                </p>
                                                <textarea
                                                    placeholder="Write a reply..."
                                                    value={replyText}
                                                    onChange={handleReplyChange}
                                                />
                                                <button onClick={handleSendReply}>Send Reply</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )

                )}

                <div className="">
                    <MentionsInput
                        value={newMessage}
                        onChange={(event, newValue, newPlainTextValue, mentions) => {
                            setNewMessage(newValue);
                            const newSelectedUsers = new Set([...selectedUsers]);
                            mentions.forEach(mention => newSelectedUsers.add(mention.id));
                            setSelectedUsers(newSelectedUsers);

                            setMentions(mentions.map(mention => `@${mention.display}`));
                            setMentionIds(mentions.map(mention => mention.id));
                        }}
                        onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 'Enter') {
                                e.preventDefault(); // Prevent newline
                                if (!buttonDisabled) sendMessage(); // Call your message sending function
                            }
                        }}
                        placeholder="Use @ to mention someone"
                        className="mentions-input"
                        style={{
                            control: {
                                backgroundColor: '#fff',
                                fontSize: 14,
                                minHeight: 100,
                                border: '1px solid #ccc',
                                borderRadius: 4,
                            },
                            input: {
                                margin: 0,
                                padding: '8px 3px',
                                outline: 'none',
                            },
                            suggestions: {
                                list: {
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    fontSize: 14,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    marginLeft: 25,
                                    marginTop: 16,
                                    position: 'absolute',
                                    zIndex: 1000
                                },
                                item: {
                                    padding: '5px 15px',
                                    borderBottom: '1px solid rgba(0,0,0,0.15)',
                                    '&focused': {
                                        backgroundColor: '#CAE5FF',
                                        outline: 'none'
                                    }
                                }
                            },
                            highlighter: {
                                overflow: 'hidden',
                                outline: 'none'
                            }
                        }}
                    >
                        <Mention
                            trigger="@"
                            data={users.filter(user => !selectedUsers.has(user.id)).map(user => ({ id: user.id, display: user.name }))}
                            renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
                                <div className={`user-suggestion ${focused ? 'focused' : ''}`}>
                                    {suggestion.display}
                                </div>
                            )}
                            style={{
                                backgroundColor: '#DAF0FAFF',
                                color: '#0057B300',
                                marginTop: '-6px',

                            }}
                        />
                    </MentionsInput>

                    <div className='flex items-center justify-between mt-2'>
                        <div>
                            {((loopUserObject.fld_email == 'puneet@redmarkediting.com' ||
                                loopUserObject.fld_email == 'clientsupport@chankyaresearch.net') && ((status == 0 && submittedToAdmin == "true") || status == 2)) ? (
                                <div className="flex items-center">
                                    <label className='mb-0' for="markStatus" style={{ fontSize: "11px" }}>Mark as pending at user</label>
                                    <input
                                        type="checkbox"
                                        id="markStatus"
                                        checked={markStatus}
                                        onChange={(e) => setMarkStatus(e.target.checked)}
                                        className="form-checkbox text-blue-600 nw-1 nh-1 ml-1"
                                        title="This will change status to Pending at user"
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className='flex items-end justify-end'>
                            {allDetails.parent_quote == true && (
                                <div className="flex items-end justify-end ">
                                    <label
                                        htmlFor="fileInput"
                                        data-tooltip-id="my-tooltip"
                                        data-tooltip-content="Attach File"
                                        className="border border-gray-300 rounded px-2 py-1 bg-gray-100 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 mb-0 mr-2"
                                    >
                                        <Paperclip size={15} />
                                    </label>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            <button
                                onClick={sendMessage}
                                disabled={buttonDisabled}
                                className="text-white chatsbut "
                            >
                                {buttonDisabled ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
                {fileName && (
                    <div className='d-flex justify-end'>
                        <div className="flex items-center justify-end space-x-2 bg-red-100 d-inline-flex mt-3 p-2">
                            <span className="text-sm text-right text-gray-500">{fileName}</span>
                            <button
                                onClick={clearFile}
                                className="text-sm text-white bg-red-500 rounded-full p-1 hover:bg-red-600"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{mentionsStyles}</style>
        </div>
    );
};