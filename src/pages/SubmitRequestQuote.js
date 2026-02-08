import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import CustomLoader from '../CustomLoader';
import { io } from "socket.io-client";
import { getSocket } from './Socket';


const SubmitRequestQuote = ({ refId, after, onClose, userIdDefined, clientName, parentQuote }) => {
    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [otherCurrency, setOtherCurrency] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
    const [otherSubjectArea, setOtherSubjectArea] = useState('');
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [planComments, setPlanComments] = useState({});
    const [wordCounts, setWordCounts] = useState({});
    const [wordCountTexts, setWordCountTexts] = useState({});
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState([{ id: Date.now(), file: null }]);
    const [submitting, setSubmitting] = useState(false);
    const [isfeasability, setIsFeasability] = useState(0);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const userRef = useRef(null);
    const plans = ['Basic', 'Standard', 'Advanced']; // Hardcoded plans
    const [demodone, setDemodone] = useState('no');
    const [demoId, setDemoId] = useState('');
    const [demoDuration, setDemoDuration] = useState('');
    const [demoDate, setDemoDate] = useState('');
    const [client_academic_level, setClient_academic_level] = useState('');
    const [results_section, setResults_section] = useState('');

    const [timeline, setTimeline] = useState('normal');
    const [timelineDays, setTimelineDays] = useState('');

    const [linkedQuotePresent, setLinkedQuotePresent] = useState(false);
    const [linkedQuoteId, setLinkedQuoteId] = useState('');

    const [demoStatus, setDemoStatus] = useState(false);
    const [tags, setTags] = useState([]);
    const tagsRef = useRef(null);
    const serviceRef = useRef(null);
    const socket = getSocket();

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }], // Text color & highlight
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['clean']
        ]
    };

    const handleCheckboxChange = (plan) => {
        setSelectedPlans((prev) =>
            prev.includes(plan)
                ? prev.filter((p) => p !== plan) // Remove if already selected
                : [...prev, plan] // Add if not selected
        );
    };
    const handleCommentChange = (plan, value) => {
        setPlanComments((prev) => ({
            ...prev,
            [plan]: value,
        }));

    };
    const handleWordCountChange = (plan, value) => {
        if (!isNaN(value)) {
            setWordCounts((prev) => ({
                ...prev,
                [plan]: value,
            }));
        }
    };
    const numberToWords = (num) => {
        const toWords = require("number-to-words");
        return toWords.toWords(Number(num));
    };

    useEffect(() => {
        const updatedWordCountTexts = {};
        for (const plan in wordCounts) {
            const wordCount = parseInt(wordCounts[plan], 10);
            if (!isNaN(wordCount) && wordCount >= 0) {
                updatedWordCountTexts[plan] = numberToWords(wordCount) + " words";
            } else {
                updatedWordCountTexts[plan] = "";
            }
        }
        setWordCountTexts(updatedWordCountTexts);
    }, [wordCounts]);

    useEffect(() => {
        // Initialize select2 for Tags
        $(serviceRef.current).select2({
            placeholder: "Select Services",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setSelectedService(selectedValues);
        });


        $(serviceRef.current).val(selectedService).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (serviceRef.current) {
                $(serviceRef.current).select2('destroy');
            }
        };
    }, [services]);

    useEffect(() => {
        // Initialize select2 for Tags
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setSelectedTags(selectedValues);
        });


        $(tagsRef.current).val(selectedTags).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);

    const planColors = {
        Basic: 'text-blue-400', // Custom brown color
        Standard: 'text-gray-400', // Silver color
        Advanced: 'text-yellow-500', // Gold color
    };

    const userData = localStorage.getItem('user');
    const LoopUserData = localStorage.getItem('loopuser');

    // Parse the JSON string into an object
    const userObject = JSON.parse(userData);

    const loopUserObject = JSON.parse(LoopUserData);

    const checkDemoStatus = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/checkDemoDoneStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ref_id: refId }), // Send category in the request body
            });
            const data = await response.json();
            if (data.status && data.data.length > 0) {
                const firstDemo = data.data[0];

                setDemoStatus(true);
                setDemodone("yes")
                setDemoId(firstDemo.demo_id || "");
                setDemoDuration(firstDemo.demo_duration || ""); // ✅ default to empty string if null
                setDemoDate(firstDemo.demo_date || "")
            } else {
                // toast.error('Failed to check status');
            }
        } catch (error) {
            console.error('Error checking status:', error);
            toast.error('Error checking status');
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getCurrencies');
            const data = await response.json();
            if (data.status) {
                setCurrencies(data.data || []); // Set fetched currencies
            } else {
                toast.error('Failed to fetch currencies');
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
            toast.error('Error fetching currencies');
        }
    };

    const fetchServices = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user')); // Parse user object from localStorage
            const category = user?.category; // Retrieve the category

            if (!category) {
                toast.error('Category is not available in localStorage');
                return;
            }

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getAllServices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category }), // Send category in the request body
            });

            const data = await response.json();

            if (data.status) {
                setServices(data.data || []); // Set fetched services
            } else {
                toast.error('Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Error fetching services');
        }
    };

    const fetchUsers = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('loopuser')); // Parse user object from localStorage
            const user_id = user?.id; // Retrieve the category

            if (!user_id) {
                toast.error('User is not available in localStorage');
                return;
            }

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getAllUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id }), // Send category in the request body
            });

            const data = await response.json();

            if (data.status) {
                setUsers(data.data || []); // Set fetched services
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        }
    };
    const fetchTags = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getTags');
            const data = await response.json();
            if (data.status) setTags(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch tags.');
        }
    };

    const handleFileChange = (id, event) => {
        const updatedFiles = files.map((item) =>
            item.id === id ? { ...item, file: event.target.files[0] } : item
        );
        setFiles(updatedFiles);
    };

    const handleAddFileInput = () => {
        setFiles([...files, { id: Date.now(), file: null }]);
    };

    const handleRemoveFileInput = (id) => {
        setFiles(files.filter((item) => item.id !== id));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!selectedCurrency || !selectedService || !selectedPlans) {
            toast.error('Please fill in all fields');
            setSubmitting(false);
            return;

        }
        if (selectedCurrency == "Other" && !otherCurrency) {
            toast.error('Please enter other currrency name!');
            setSubmitting(false);
            return;
        }
        if (isfeasability == 1 && !selectedUser) {
            toast.error('Please select user to assign!');
            setSubmitting(false);
            return;
        }
        if (demodone == "yes" && !demoId) {
            toast.error('Please Enter Demo ID!');
            setSubmitting(false);
            return;
        }
        if (selectedSubjectArea == "") {
            toast.error('Please select subject area!');
            setSubmitting(false);
            return;
        }
        if (linkedQuotePresent && !linkedQuoteId) {
            toast.error('Please enter linked quote id!');
            setSubmitting(false);
            return;
        }
        if (isfeasability == 0 && selectedTags.length == 0) {
            toast.error('Please select atleast one Tag!');
            setSubmitting(false);
            return;
        }

        if (selectedSubjectArea == "Other" && !otherSubjectArea) {
            toast.error('Please enter other subject area name!');
            setSubmitting(false);
            return;
        }
        if (!client_academic_level) {
            toast.error('Please select client academic level!');
            setSubmitting(false);
            return;
        }
        if (!results_section) {
            toast.error('Please select results section!');
            setSubmitting(false);
            return;
        }
        if (!timeline) {
            toast.error('Please select timeline!');
            setSubmitting(false);
            return;
        }
        if (timeline == 'urgent' && (!timelineDays || timelineDays == '')) {
            toast.error('Please select timeline days!');
            setSubmitting(false);
            return;
        }

        const planOrder = ['Basic', 'Standard', 'Advanced'];
        const sortedPlans = selectedPlans.sort((a, b) => {
            return planOrder.indexOf(a) - planOrder.indexOf(b);
        });

        const formData = new FormData();
        formData.append('ref_id', refId);
        formData.append('currency', selectedCurrency);
        formData.append('other_currency', otherCurrency);
        formData.append('service_name', selectedService);
        formData.append('client_academic_level', client_academic_level);
        formData.append('results_section', results_section);
        formData.append('subject_area', selectedSubjectArea);
        formData.append('other_subject_area', otherSubjectArea);
        formData.append('plan', sortedPlans);
        formData.append('comments', comments);
        formData.append('client_name', clientName);
        formData.append('timeline', timeline);
        formData.append('timeline_days', timelineDays);
        formData.append('linked_quote_present', linkedQuotePresent);
        formData.append('linked_quote_id', linkedQuoteId);
        let planCommentsJson = {};
        let planWordCountsJson = {};
        let emptyCommentFound = false;
        let emptyWordCountFound = false;

        // Collect plan comments
        selectedPlans.forEach((plan) => {
            const comment = planComments[plan] || '';
            const wordCount = wordCounts[plan] || '';
            if (comment.trim() === '') {
                emptyCommentFound = true;
                toast.error(`Please add a comment for the ${plan} plan!`);
            }

            if (wordCount.trim() === '' || isNaN(wordCount) || parseInt(wordCount) < 0) {
                emptyWordCountFound = true;
                toast.error(`Please enter a valid word count for the ${plan} plan!`);
            }

            // Add the plan and its comment to the planCommentsJson object
            planCommentsJson[plan] = comment;
            planWordCountsJson[plan] = parseInt(wordCount) || 0;

            formData.append(`plan_comments_${plan}`, comment); // Optionally append individual plan comments to FormData
            formData.append(`plan_word_count_${plan}`, wordCount);
        });

        // If there's any empty comment, stop the form submission
        if (emptyCommentFound || emptyWordCountFound) {
            setSubmitting(false);
            return;
        }

        // Append the entire plan_comments JSON as a string to FormData
        formData.append('plan_comments_json', JSON.stringify(planCommentsJson));
        formData.append('plan_word_counts_json', JSON.stringify(planWordCountsJson));

        formData.append('isfeasability', isfeasability);
        formData.append('feasability_user', selectedUser);
        formData.append('user_id', (userIdDefined && userIdDefined != null && userIdDefined != "") ? userIdDefined : loopUserObject.id);
        formData.append('user_name', loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name);
        formData.append('category', userObject.category);
        formData.append('demo_done', demodone);
        formData.append('demo_id', demoId);
        formData.append('demo_duration', demoDuration);
        formData.append('demo_date', demoDate);
        formData.append('tags', selectedTags);
        files.forEach((item, index) => {
            if (item.file) {
                formData.append(`quote_upload_file[]`, item.file);
            }
        });

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/submitRequestQuoteApiActionNew/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Quote request submitted successfully');
                socket.emit("newRequest", data.quote_details)

                after();
                onClose();
            } else {
                toast.error('Failed to submit quote request');
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);

        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        checkDemoStatus();
        fetchCurrencies();
        fetchServices();
        fetchUsers();
        fetchTags();
    }, []);

    useEffect(() => {
        // Initialize select2 for Tags
        $(userRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedUser($(e.target).val());
        });


        $(userRef.current).val(selectedUser).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (userRef.current) {
                $(userRef.current).select2('destroy');
            }
        };
    }, [users]);


    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
        >
            <div className="bg-white p-6 m-3 space-y-4 w-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-700 text-white p-2 rounded-lg shadow-lg">
                    {/* Tabs */}
                    <div className="flex items-center space-x-4">
                        <h2
                            className={`tab-btn-n-set cursor-pointer px-2 py-1 rounded-lg transition-colors ${isfeasability == 0
                                ? "bg-white text-blue-700 shadow-md"
                                : "bg-blue-600 hover:bg-blue-500 text-gray-200"
                                }`}
                            onClick={() => setIsFeasability(0)}
                        >
                            Ask For Scope
                        </h2>

                        <h2
                            className={`tab-btn-n-set cursor-pointer px-2 py-1 rounded-lg transition-colors ${isfeasability == 1
                                ? "bg-white text-blue-700 shadow-md"
                                : "bg-blue-600 hover:bg-blue-500 text-gray-200"
                                }`}
                            onClick={() => setIsFeasability(1)}
                        >
                            Ask For Feasibility Check
                        </h2>

                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className='p-3 m-0 relative'>
                    {submitting && (
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                            <CustomLoader />
                        </div>
                    )}
                    {/* <button onClick={testSocket}>
                        test
                    </button> */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="ref_id" value={refId} />

                        <div className='w-full grid grid-cols-3 gap-4 space-x-1'>
                            {/* Currency Dropdown */}
                            <div className='w-full'>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select
                                    id="currency"
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select Currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.name}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCurrency == 'Other' && (
                                <div className="w-full">
                                    <label htmlFor="otherCurrency" className="block text-sm font-medium text-gray-700">
                                        Other Currency Name
                                    </label>
                                    <input
                                        type="text"
                                        id="otherCurrency"
                                        value={otherCurrency}
                                        onChange={(e) => setOtherCurrency(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                        placeholder="Currency name"
                                    />
                                </div>
                            )}

                            {/* Service Name Dropdown */}
                            <div className='w-full'>
                                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                                    Service Name
                                </label>
                                <select
                                    id="service_name"
                                    multiple
                                    value={selectedService}
                                    ref={serviceRef}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </div>
                        <div className='flex w-full items-end space-x-2'>
                            <div className='w-1/2'>
                                <label htmlFor="subject_area" className="block text-sm font-medium text-gray-700">
                                    Subject Area
                                </label>
                                <select
                                    id="subject_area"
                                    value={selectedSubjectArea}
                                    onChange={(e) => setSelectedSubjectArea(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select Subject Area</option>

                                    <option value="Accounting">Accounting</option>
                                    <option value="Accounts Law">Accounts Law</option>
                                    <option value="Agency Law">Agency Law</option>
                                    <option value="Alternative Dispute Resolution (ADR)/Mediation">Alternative Dispute Resolution (ADR)/Mediation</option>
                                    <option value="Anthropology">Anthropology</option>
                                    <option value="Archaeology">Archaeology</option>
                                    <option value="Architecture">Architecture</option>
                                    <option value="Art">Art</option>
                                    <option value="Biology">Biology</option>
                                    <option value="Business">Business</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Children &amp; Young People">Children &amp; Young People</option>
                                    <option value="Civil Litigation Law">Civil Litigation Law</option>
                                    <option value="Commercial Law">Commercial Law</option>
                                    <option value="Commercial Property Law">Commercial Property Law</option>
                                    <option value="Communications">Communications</option>
                                    <option value="Company/business/partnership Law">Company/business/partnership Law</option>
                                    <option value="Comparative Law">Comparative Law</option>
                                    <option value="Competition Law">Competition Law</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Constitutional/administrative Law">Constitutional/administrative Law</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Consumer Law">Consumer Law</option>
                                    <option value="Contract Law">Contract Law</option>
                                    <option value="Corporate Finance">Corporate Finance</option>
                                    <option value="Counselling">Counselling</option>
                                    <option value="Criminal Law">Criminal Law</option>
                                    <option value="Criminal Litigation">Criminal Litigation</option>
                                    <option value="Criminology">Criminology</option>
                                    <option value="Cultural Studies">Cultural Studies</option>
                                    <option value="Cybernetics">Cybernetics</option>
                                    <option value="Design">Design</option>
                                    <option value="Dental">Dental</option>
                                    <option value="Drama">Drama</option>
                                    <option value="Economics">Economics</option>
                                    <option value="EEconometrics">EEconometrics</option>
                                    <option value="Education">Education</option>
                                    <option value="Employment">Employment</option>
                                    <option value="Employment Law">Employment Law</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="English Language">English Language</option>
                                    <option value="English Literature">English Literature</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Environment Law">Environment Law</option>
                                    <option value="Environmental Sciences">Environmental Sciences</option>
                                    <option value="Equity Law">Equity Law</option>
                                    <option value="Estate Management">Estate Management</option>
                                    <option value="European Law">European Law</option>
                                    <option value="European Studies">European Studies</option>
                                    <option value="Eviews">Eviews</option>
                                    <option value="Family Law">Family Law</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Film Studies">Film Studies</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Finance Law">Finance Law</option>
                                    <option value="Food and Nutrition">Food and Nutrition</option>
                                    <option value="Forensic Science">Forensic Science</option>
                                    <option value="French">French</option>
                                    <option value="General Law">General Law</option>
                                    <option value="Geography">Geography</option>
                                    <option value="Geology">Geology</option>
                                    <option value="German">German</option>
                                    <option value="Health">Health</option>
                                    <option value="Health &amp; Social Care">Health &amp; Social Care</option>
                                    <option value="Health and Safety">Health and Safety</option>
                                    <option value="Health and Safety Law">Health and Safety Law</option>
                                    <option value="History">History</option>
                                    <option value="Holistic/alternative therapy">Holistic/alternative therapy</option>
                                    <option value="Housing">Housing</option>
                                    <option value="Housing Law">Housing Law</option>
                                    <option value="Human Resource Management">Human Resource Management</option>
                                    <option value="Human Rights">Human Rights</option>
                                    <option value="HR">HR</option>
                                    <option value="Immigration/refugee Law">Immigration/refugee Law</option>
                                    <option value="Information - Media &amp; Technology Law">Information - Media &amp; Technology Law</option>
                                    <option value="Information Systems">Information Systems</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="IT">IT</option>
                                    <option value="Intellectual Property Law">Intellectual Property Law</option>
                                    <option value="International Business">International Business</option>
                                    <option value="International Commerical Law">International Commerical Law</option>
                                    <option value="International Law">International Law</option>
                                    <option value="International political economy">International political economy</option>
                                    <option value="International Relations">International Relations</option>
                                    <option value="International Studies">International Studies</option>
                                    <option value="Jurisprudence">Jurisprudence</option>
                                    <option value="Land/property Law">Land/property Law</option>
                                    <option value="Landlord &amp; Tenant Law">Landlord &amp; Tenant Law</option>
                                    <option value="Law of Evidence">Law of Evidence</option>
                                    <option value="Life Sciences">Life Sciences</option>
                                    <option value="Linguistics">Linguistics</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Management">Management</option>
                                    <option value="Maritime Law">Maritime Law</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Maths">Maths</option>
                                    <option value="Media">Media</option>
                                    <option value="Medical Law">Medical Law</option>
                                    <option value="Medical Technology">Medical Technology</option>
                                    <option value="Medicine">Medicine</option>
                                    <option value="Mental Health">Mental Health</option>
                                    <option value="Mental Health Law">Mental Health Law</option>
                                    <option value="Methodology">Methodology</option>
                                    <option value="Music">Music</option>
                                    <option value="Negligence Law">Negligence Law</option>
                                    <option value="Nursing">Nursing</option>
                                    <option value="Occupational therapy">Occupational therapy</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Pharmacology">Pharmacology</option>
                                    <option value="Philosophy">Philosophy</option>
                                    <option value="Photography">Photography</option>
                                    <option value="Physical Education">Physical Education</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Planning/environmental Law">Planning/environmental Law</option>
                                    <option value="Politics">Politics</option>
                                    <option value="Project Management">Project Management</option>
                                    <option value="Professional Conduct Law">Professional Conduct Law</option>
                                    <option value="Psychology">Psychology</option>
                                    <option value="Psychotherapy">Psychotherapy</option>
                                    <option value="Public Administration">Public Administration</option>
                                    <option value="Public Health">Public Health</option>
                                    <option value="Public Law">Public Law</option>
                                    <option value="Quantity Surveying">Quantity Surveying</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Restitution Law">Restitution Law</option>
                                    <option value="Shipping Law">Shipping Law</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Social Policy">Social Policy</option>
                                    <option value="Social Work">Social Work</option>
                                    <option value="Social Work Law">Social Work Law</option>
                                    <option value="Sociology">Sociology</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="Sports Law">Sports Law</option>
                                    <option value="Sports Science">Sports Science</option>
                                    <option value="SPSS">SPSS</option>
                                    <option value="Statistics">Statistics</option>
                                    <option value="Succession Law">Succession Law</option>
                                    <option value="Supply">Supply Chain</option>
                                    <option value="Tax Law">Tax Law</option>
                                    <option value="Teacher Training">Teacher Training</option>
                                    <option value="Theatre Studies">Theatre Studies</option>
                                    <option value="Theology &amp; Religion">Theology &amp; Religion</option>
                                    <option value="Tort Law">Tort Law</option>
                                    <option value="Tourism">Tourism</option>
                                    <option value="Town &amp; Country Planning">Town &amp; Country Planning</option>
                                    <option value="Translation">Translation</option>
                                    <option value="Trusts Law">Trusts Law</option>
                                    <option value="Wills/probate Law">Wills/probate Law</option>
                                    <option value="Economics (Social Sciences)">Economics (Social Sciences)</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            {selectedSubjectArea == "Other" && (
                                <div className='w-1/2'>
                                    <input
                                        type="text"
                                        id="other_subject_area"
                                        value={otherSubjectArea}
                                        onChange={(e) => setOtherSubjectArea(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                        placeholder="Enter Other Subject Area"
                                    />
                                </div>
                            )}
                        </div>

                        <div className='flex w-full items-end space-x-2'>
                            <div className='w-1/2'>
                                <label htmlFor="client_academic_level" className="block text-sm font-medium text-gray-700">
                                    Client's Academic level
                                </label>
                                <select
                                    id="client_academic_level"
                                    value={client_academic_level}
                                    onChange={(e) => setClient_academic_level(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select academic level</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Bachelors">Bachelors</option>
                                    <option value="Masters">Masters</option>
                                    <option value="Post Doctoral">Post Doctoral</option>
                                    <option value="Author">Author</option>

                                </select>
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="results_section" className="block text-sm font-medium text-gray-700">
                                    Results Section
                                </label>
                                <select
                                    id="results_section"
                                    value={results_section}
                                    onChange={(e) => setResults_section(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="">Select results section</option>
                                    <option value="Client will provide">Client will provide</option>
                                    <option value="We need to work">We need to work</option>
                                    <option value="Partially client will provide">Partially client will provide</option>
                                    <option value="Theoretical Work">Theoretical Work</option>

                                </select>
                            </div>
                        </div>

                        <div className='flex w-full items-end space-x-2 mt-4'>
                            <div className='w-1/2'>
                                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                                    Timeline
                                </label>
                                <select
                                    id="timeline"
                                    value={timeline}
                                    onChange={(e) => {
                                        setTimeline(e.target.value);
                                        if (e.target.value !== 'Urgent') {
                                            setTimelineDays('');
                                        }
                                    }}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            {timeline === 'urgent' && (
                                <div className='w-1/2'>
                                    <label htmlFor="timelineDays" className="block text-sm font-medium text-gray-700">
                                        Timeline Days
                                    </label>
                                    <select
                                        id="timelineDays"
                                        value={timelineDays}
                                        onChange={(e) => setTimelineDays(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                    >
                                        <option value="">Select days</option>
                                        {Array.from({ length: 90 }, (_, i) => i + 1).map((day) => (
                                            <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className='flex w-full items-end space-x-2 mt-4'>
                            <div className='w-1/2'>
                                <label htmlFor="linkedQuotePresent" className="block text-sm font-medium text-gray-700">
                                    Any linked quote ID?
                                </label>
                                <select
                                    id="linkedQuotePresent"
                                    value={linkedQuotePresent ? "yes" : "no"}
                                    onChange={(e) => setLinkedQuotePresent(e.target.value === "yes")}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>

                            {linkedQuotePresent && (
                                <div className='w-1/2'>
                                    <label htmlFor="linkedQuoteId" className="block text-sm font-medium text-gray-700">
                                        Enter Scope ID
                                    </label>
                                    <input
                                        type="text"
                                        id="linkedQuoteId"
                                        value={linkedQuoteId}
                                        onChange={(e) => setLinkedQuoteId(e.target.value)}
                                        placeholder="Enter Scope ID"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                    />
                                </div>
                            )}
                        </div>


                        {/* Plan Dropdown */}
                        <div className="w-full mt-4">
                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                Plan
                            </label>
                            <div className="mt-1 flex">
                                {plans.map((plan, index) => (
                                    <div key={index} className="flex items-center mb-2 mr-5">
                                        <input
                                            type="checkbox"
                                            id={`plan-${index}`}
                                            value={plan}
                                            checked={selectedPlans.includes(plan)}
                                            onChange={() => handleCheckboxChange(plan)}
                                            className={`form-checkbox h-4 w-4 border-gray-300 rounded ${planColors[plan]}`}
                                        />
                                        <label htmlFor={`plan-${index}`} className={`ml-2 mb-0 text-sm font-medium ${planColors[plan]}`}>
                                            {plan}
                                        </label>

                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            {selectedPlans.sort((a, b) => {
                                const order = ['Basic', 'Standard', 'Advanced'];
                                return order.indexOf(a) - order.indexOf(b); // Sort based on the predefined order
                            }).map((plan) => (
                                <>
                                    <div key={plan} className="mb-4">
                                        <label htmlFor={`comment_${plan}`} className="block text-sm font-medium text-gray-700">
                                            Add comment for {plan} plan
                                        </label>
                                        <ReactQuill
                                            value={planComments[plan] || ''}
                                            onChange={(value) => handleCommentChange(plan, value)} // Handle Quill's onChange
                                            className="mt-1"
                                            theme="snow"
                                            modules={modules}
                                            placeholder={`Add comment for ${plan} plan`}
                                        />
                                    </div>
                                    <div className="my-2 flex items-end">
                                        <div className='flex flex-col'>
                                            <label htmlFor={`word_count_${plan}`} className="block text-sm font-medium text-gray-700">
                                                Enter Word Count for {plan} Plan
                                            </label>
                                            <input
                                                type="text" // Changed to text to remove spinner (up/down buttons)
                                                id={`word_count_${plan}`}
                                                className="mt-1 block w-full py-1 px-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                value={wordCounts[plan] || ''}
                                                onChange={(e) => handleWordCountChange(plan, e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (!/^[0-9]$/.test(e.key)) {
                                                        e.preventDefault(); // Block non-numeric characters and special characters
                                                    }
                                                }}
                                                placeholder="Enter word count"
                                            />
                                        </div>
                                        {wordCountTexts[plan] && (
                                            <span className="text-gray-600 text-sm ml-3">
                                                {wordCountTexts[plan]}
                                            </span>
                                        )}
                                    </div>


                                </>
                            ))}
                        </div>

                        <div className={`w-full ${isfeasability == 0 ? "hidden" : "block"}`}>
                            {/* Tags */}
                            <label className="block text-sm font-medium text-gray-700">Select User to Assign</label>
                            <select
                                name="user"
                                id="user"
                                className="form-select select2 w-72 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 form-control"

                                value={selectedUser}
                                ref={userRef}
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='w-full '>
                            {/* Tags */}
                            <label>Tags</label>
                            <select
                                name="tags"
                                id="tags"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control select2-hidden-accessible"
                                multiple
                                value={selectedTags}
                                ref={tagsRef}
                            >
                                <option value="">Select Tags</option>
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.tag_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className=" flex w-full mt-4" style={{ display: `${demoStatus ? 'none' : 'block'}` }}>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="demodone"
                                    checked={demoStatus}
                                    onChange={(e) => setDemodone(e.target.checked ? "yes" : "no")}
                                    className="h-4 w-4 border-gray-300 rounded"
                                />
                                <label htmlFor="demodone" className="ml-2 text-sm font-medium text-gray-700">
                                    Demo Done
                                </label>
                            </div>
                            <div className="ml-5" style={{ display: (demodone == "yes") ? "block" : "none" }}>

                                <input
                                    type="text"
                                    id="demo_id"
                                    value={demoId}
                                    onChange={(e) => setDemoId(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
                                    placeholder="Enter Demo ID"
                                />
                            </div>
                        </div>
                        <div className='flex items-start justify-between space-x-1 mt-4'>
                            {/* Comments */}
                            <div className="w-full">
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                    Additional Comments <span className='text-gray-400 text-sm ml-2'>(optional)</span>
                                </label>
                                <ReactQuill
                                    value={comments}
                                    onChange={setComments}
                                    className="mt-1"
                                    theme="snow"
                                    placeholder="Add your comments here"
                                    modules={modules}

                                />
                            </div>



                        </div>

                        {parentQuote && (
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Upload Files</label>
                                {files.map((item, index) => (
                                    <div key={item.id} className="flex items-center mt-1 space-x-2">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(item.id, e)}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFileInput(item.id)}
                                                className="px-2 py-1 bg-red-500 text-white rounded white-space-nowrap f-14"
                                            >
                                                - Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddFileInput}
                                    className="mt-2 px-2 py-1 bg-green-500 text-white rounded f-14"
                                >
                                    + Add
                                </button>
                            </div>
                        )}


                        {/* Submit Button */}
                        <div className='text-right'>
                            <button
                                type="submit"
                                disabled={submitting}
                                className=" bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 f-14"
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </motion.div>
    );
};

export default SubmitRequestQuote;
