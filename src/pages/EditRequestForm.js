import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import axios from 'axios';

const EditRequestForm = ({ refId, quoteId, after, onClose }) => {
    const [formData, setFormData] = useState({
        currency: '',
        otherCurrency: '',
        service_name: '',
        plan: [],
        comments: '',
        planComments: {},
        wordCounts: {},
        isfeasability: 0,
        selectedUser: ''
    });
    const [currency, setCurrency] = useState('');
    const [otherCurrency, setOtherCurrency] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
    const [otherSubjectArea, setOtherSubjectArea] = useState('');
    const [client_academic_level, setClient_academic_level] = useState('');
    const [results_section, setResults_section] = useState('');

    const [timeline, setTimeline] = useState('');
    const [timelineDays, setTimelineDays] = useState('');

    const [linkedQuotePresent, setLinkedQuotePresent] = useState(false);
    const [linkedQuoteId, setLinkedQuoteId] = useState('');

    const [plan, setPlan] = useState([]);
    const [comments, setComments] = useState('');
    const [planComments, setPlanComments] = useState({});
    const [isFeasability, setIsFeasability] = useState(0);
    const [selectedUser, setSelectedUser] = useState('');
    const [wordCountTexts, setWordCountTexts] = useState({});
    const serviceRef = useRef(null);

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

    const [currencies, setCurrencies] = useState([]);
    const [users, setUsers] = useState([]);
    const userRef = useRef(null);
    const [services, setServices] = useState([]);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const userData = localStorage.getItem('loopuser');
    const hasFetched = useRef(false);




    const userObject = JSON.parse(userData);

    const plans = ['Basic', 'Standard', 'Advanced'];

    const handleCommentChange = (plan, value) => {
        // Update the planComments state with the new comment for the selected plan
        setFormData((prevState) => ({
            ...prevState,
            planComments: {
                ...prevState.planComments,
                [plan]: value,
            },
        }));
    };

    const handleWordCountChange = (plan, value) => {
        if (!isNaN(value)) {
            setFormData((prevState) => ({
                ...prevState,
                wordCounts: {
                    ...prevState.wordCounts,
                    [plan]: value,
                },
            }));
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getCurrencies');
            const data = await response.json();
            if (data.status) setCurrencies(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch currencies.');
        }
    };

    const fetchServices = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getServices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: user?.category }),
            });
            const data = await response.json();
            if (data.status) setServices(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch services.');
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

    const numberToWords = (num) => {
        const toWords = require("number-to-words");
        return toWords.toWords(Number(num));
    };

    useEffect(() => {
        const updatedWordCountTexts = {};
        for (const plan in formData.wordCounts) {
            const wordCount = parseInt(formData.wordCounts[plan], 10);
            if (!isNaN(wordCount) && wordCount > 0) {
                updatedWordCountTexts[plan] = numberToWords(wordCount) + " words";
            } else {
                updatedWordCountTexts[plan] = "";
            }
        }
        setWordCountTexts(updatedWordCountTexts);
    }, [formData.wordCounts]);




    const handleInputChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'currency':
                setCurrency(value);
                break;
            case 'otherCurrency':
                setOtherCurrency(value);
                break;
            case 'service_name':
                setServiceName(value);
                break;
            case 'comments':
                setComments(value);
                break;
            case 'isfeasability':
                setIsFeasability(value);
                break;
            case 'selectedUser':
                setSelectedUser(value);
                break;
            case 'plan':
                setPlan(value.split(',')); // Assuming plan is a comma-separated string
                break;
            default:
                break;
        }
    };


    const handleCheckboxChange = (plan) => {
        setFormData((prev) => ({
            ...prev,
            plan: prev.plan.includes(plan)
                ? prev.plan.filter((p) => p != plan)
                : [...prev.plan, plan],
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const allCommentsFilled = Object.values(formData.planComments).every(comment => {
            // Check if the comment contains only spaces, <br>, or empty <p> tags
            const plainTextComment = comment.replace(/<[^>]*>/g, '').trim();  // Remove HTML tags
            return plainTextComment !== '';  // Ensure there's something other than just empty content
        });

        if (!allCommentsFilled) {
            toast.error('Please fill all plan comments.');
            setSubmitting(false);
            return;
        }


        if (selectedSubjectArea == "") {
            toast.error('Please select subject area!');
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

        if (linkedQuotePresent && !linkedQuoteId) {
            toast.error('Please enter linked quote id!');
            setSubmitting(false);
            return;
        }

        try {
            const payload = new FormData();
            payload.append('ref_id', refId);
            payload.append('quote_id', quoteId);
            payload.append('currency', currency);
            payload.append('other_currency', otherCurrency);
            payload.append('service_name', serviceName);
            payload.append('subject_area', selectedSubjectArea);
            payload.append('client_academic_level', client_academic_level);
            payload.append('results_section', results_section);

            payload.append('timeline', timeline);
            payload.append('timeline_days', timelineDays);
            payload.append('linked_quote_present', linkedQuotePresent);
            payload.append('linked_quote_id', linkedQuoteId);


            payload.append('other_subject_area', otherSubjectArea);
            const planOrder = ['Basic', 'Standard', 'Advanced'];

            // Ensure formData.plan is sorted in the desired order
            const sortedPlans = formData.plan.sort((a, b) => {
                return planOrder.indexOf(a) - planOrder.indexOf(b);
            });

            // Send sorted plans as a single string
            payload.append('plan', sortedPlans.join(','));

            payload.append('comments', comments);
            payload.append('plan_comments', JSON.stringify(formData.planComments));
            payload.append('word_counts', JSON.stringify(formData.wordCounts));
            payload.append('user_id', userObject.id);
            payload.append('feas_user', selectedUser);

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/updateRequestQuoteApiAction', {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Request updated successfully.');
                after();
                onClose();
            } else {
                toast.error('Failed to update request.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Error updating request.');
        } finally {
            setSubmitting(false);
        }
    };
    const fetchData = async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        try {
            setLoading(true);

            const user = JSON.parse(localStorage.getItem('user'));
            const loopUser = JSON.parse(localStorage.getItem('loopuser'));
            const category = user?.category;
            const user_id = loopUser?.id;

            if (!user_id) {
                toast.error('User is not available in localStorage');
                return;
            }

            const [currenciesResponse, servicesResponse, usersResponse, requestDetailsResponse] = await axios.all([
                axios.get('https://loopback-skci.onrender.com/api/scope/getCurrencies'),
                axios.post('https://loopback-skci.onrender.com/api/scope/getAllServices', { category }),
                axios.post('https://loopback-skci.onrender.com/api/scope/getAllUsers', { user_id }),
                fetch('https://loopback-skci.onrender.com/api/scope/getRequestDetails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
                }).then((res) => res.json()),
            ]);

            // Handle Currencies Response
            if (currenciesResponse.data.status) {
                setCurrencies(currenciesResponse.data.data || []);
            } else {
                toast.error('Failed to fetch currencies.');
            }

            // Handle Services Response
            if (servicesResponse.data.status) {
                setServices(servicesResponse.data.data || []);
            } else {
                toast.error('Failed to fetch services.');
            }

            // Handle Users Response
            if (usersResponse.data.status) {
                setUsers(usersResponse.data.data || []);
            } else {
                toast.error('Failed to fetch users.');
            }

            // Handle Request Details Response
            if (requestDetailsResponse.status) {
                const details = requestDetailsResponse.data;
                console.log(details);

                // Convert tags from comma-separated string to an array
                const planArray = details.plan ? details.plan.split(',') : [];
                const parsedPlanComments = details.plan_comments ? JSON.parse(details.plan_comments) : {};
                const parsedWordCounts = details.word_counts ? JSON.parse(details.word_counts) : {};

                const serviceArray = details.service_name ? details.service_name.split(',') : [];

                await setFormData({
                    currency: details.currency || '',
                    otherCurrency: details.other_currency || '',
                    service_name: serviceArray,
                    plan: planArray,
                    comments: details.comments || '',
                    planComments: parsedPlanComments,
                    wordCounts: parsedWordCounts,
                    isfeasability: details.isfeasability || 0,
                    selectedUser: details.feasability_user || '',
                });
                setCurrency(details.currency ?? '')
                setOtherCurrency(details.otherCurrency ?? '')
                setServiceName(details.service_name ?? '');
                setSelectedSubjectArea(details.subject_area ?? '');
                setOtherSubjectArea(details.other_subject_area ?? '');
                setPlan(planArray);
                setComments(details.comments ?? '')
                setIsFeasability(details.isfeasability ?? 0)
                setSelectedUser(details.feasability_user ?? '')
                setClient_academic_level(details.client_academic_level);
                setResults_section(details.results_section);

                setTimeline(details.timeline ?? "normal");
                setTimelineDays(details.timeline_days ?? '1');
                setLinkedQuotePresent(details.linked_quote_id !== null && details.linked_quote_id !== '');
                setLinkedQuoteId(details.linked_quote_id);

                setTimeout(() => {
                    $(serviceRef.current).val(serviceArray).trigger('change');
                }, 100);
            } else {
                toast.error('Failed to fetch request details.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // Initialize select2 for Tags
        $(serviceRef.current).select2({
            placeholder: "Select Services",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setServiceName(selectedValues);
        });


        return () => {
            // Clean up select2 on component unmount
            if (serviceRef.current) {
                $(serviceRef.current).select2('destroy');
            }
        };
    }, [services]);
    const fetchInitialData = async () => {



        try {
            setLoading(true);
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getRequestDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
            });

            const data = await response.json();
            if (data.status) {
                const details = data.data;
                console.log(details)
                // Convert tags from comma-separated string to an array
                const planArray = details.plan ? details.plan.split(',') : [];

                setFormData({
                    currency: details.currency || '',
                    otherCurrency: details.other_currency || '',
                    service_name: details.service_name || '',
                    plan: planArray,
                    comments: details.comments || '',
                    isfeasability: details.isfeasability || 0,
                    selectedUser: details.feasability_user || '',
                });




            } else {
                toast.error('Failed to fetch request details.');
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
            toast.error('Error fetching request details.');
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        // const fetchData = async () => {
        //     try {
        //         // await fetchCurrencies();
        //         // await fetchServices();
        //         // await fetchUsers();
        //         await fetchAllData();
        //         //fetchInitialData();
        //     } finally {
        //         // This will always run, ensuring fetchInitialData runs last

        //     }
        // };

        fetchData();
    }, []);
    useEffect(() => {
        //fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once


    const planColors = {
        Basic: 'text-blue-400', // Custom brown color
        Standard: 'text-gray-400', // Silver color
        Advanced: 'text-yellow-500', // Gold color
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Edit Request Form </h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>

                <div className='p-3 mt-0'>
                    <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                        <div className="w-full grid grid-cols-2 gap-2 space-x-1">
                            {/* Currency Dropdown */}
                            <div className='w-full mb-3'>
                                <label>Currency</label>
                                <select
                                    name="currency"
                                    value={currency}
                                    onChange={handleInputChange}
                                    className="form-control form-control-sm"
                                >
                                    <option value="">Select Currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.name}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>

                                {currency == 'Other' && (
                                    <input
                                        type="text"
                                        name="otherCurrency"
                                        placeholder="Enter other currency"
                                        value={otherCurrency}
                                        onChange={handleInputChange}
                                        className="form-control form-control-sm"
                                    />
                                )}
                            </div>

                            <div className='w-full mb-3'>

                                {/* Service Dropdown */}
                                <label>Service</label>
                                <select
                                    name="service_name"
                                    multiple
                                    value={serviceName}
                                    ref={serviceRef}
                                    className="form-control form-control-sm"
                                >
                                    <option value="">Select Service</option>
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
                        <div className='flex w-full items-end space-x-2 my-3'>
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

                        <div className='w-full mb-3'>
                            {/* Plan Checkboxes */}
                            <label className="">Plan</label>
                            <div className='flex'>
                                {plans.map((plan) => (
                                    <div key={plan} className="flex items-center space-x-2 mr-5">
                                        <input
                                            type="checkbox"
                                            checked={formData.plan.includes(plan)}
                                            onChange={() => handleCheckboxChange(plan)}
                                            className={`form-checkbox h-4 w-4 f-12 border-gray-300 rounded ${planColors[plan] || ''}`} // Default to empty string if no color is found
                                        />
                                        <label className={` font-medium mb-0 ${planColors[plan] || 'text-gray-700'}`}>{plan}</label> {/* Default text color */}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            {formData.plan.map((plan) => (
                                <>
                                    <div key={plan} className="mb-4">
                                        <label htmlFor={`comment_${plan}`} className="block text-sm font-medium text-gray-700">
                                            Add comment for {plan} plan
                                        </label>
                                        <ReactQuill
                                            value={formData.planComments[plan] || ''}
                                            onChange={(value) => handleCommentChange(plan, value)} // Handle Quill's onChange
                                            className="mt-1"
                                            theme="snow"
                                            placeholder={`Add comment for ${plan} plan`}
                                            modules={modules}
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
                                                value={formData.wordCounts[plan] || ''}
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
                        <div className={`w-full ${isFeasability == 0 ? "hidden" : "block"}`}>
                            {/* Tags */}
                            <label className="block text-sm font-medium text-gray-700">Select User to Assign </label>
                            <select
                                name="user"
                                id="user"
                                className="form-select select2 w-72 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 form-control"

                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='w-full mb-3'>
                            {/* Comments */}
                            <label>Additional Comments <span className='text-gray-400 text-sm ml-2'>(optional)</span></label>
                            <ReactQuill value={comments} onChange={(value) => setComments(value)} modules={modules} />
                        </div>

                        <div className='mt-2 text-right'>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                            >
                                {submitting ? 'Submitting...' : 'Update Request'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </motion.div>
    );
};

export default EditRequestForm;
