import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const InteriorConsulting = () => {
  // State for booking process
  const [step, setStep] = useState(1); // 1 = select date/time, 2 = fill form
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [designFocus, setDesignFocus] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for gallery
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeImage, setActiveImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch available dates when component mounts
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Mock function to fetch available dates from MongoDB
  const fetchAvailableDates = async () => {
    const response = await fetch('/api/consulting?type=dates');
    const data = await response.json();
    setAvailableDates(data);
  };

  // Fetch available times when date is selected
  const fetchAvailableTimes = async (date) => {
    const response = await fetch(`/api/consulting?type=times&date=${date}`);
    const data = await response.json();
    setAvailableTimes(data);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    fetchAvailableTimes(formattedDate);
    setShowDatePicker(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          userInfo: {
            name,
            email,
            phone,
            userId: 'current-user-id', // Replace with actual user ID from auth
          },
          projectDetails: {
            designFocus,
            propertyType,
            additionalNotes: projectDetails,
          },
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
        setStep(1); // Reset to step 1 after successful booking
        setSelectedDate(null);
        setSelectedTime('');
        setName('');
        setEmail('');
        setPhone('');
        setProjectDetails('');
        setDesignFocus('');
        setPropertyType('');
      } else {
        console.error('Error submitting booking:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gallery data
  const projects = [
    {
      id: 1,
      title: 'Modern Living Room',
      category: 'Living Room',
      images: ['/placeholder/project1-1.jpg', '/placeholder/project1-2.jpg'],
      description: 'A contemporary living space with minimalist furniture and warm lighting'
    },
    {
      id: 2,
      title: 'Luxury Bedroom Suite',
      category: 'Bedroom',
      images: ['/placeholder/project2-1.jpg', '/placeholder/project2-2.jpg'],
      description: 'Elegant bedroom design with custom cabinetry and premium textiles'
    },
    {
      id: 3,
      title: 'Open Concept Kitchen',
      category: 'Kitchen',
      images: ['/placeholder/project3-1.jpg', '/placeholder/project3-2.jpg'],
      description: 'Functional yet stylish kitchen with smart storage solutions'
    }
  ];

  const categories = ['All', ...new Set(projects.map(project => project.category))];

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  // Tile content for calendar to show available dates
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      const isAvailable = availableDates.includes(formattedDate);

      return isAvailable ? (
        <div className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full m-1"></div>
      ) : null;
    }
    return null;
  };

  // Disable unavailable dates in calendar
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      return !availableDates.includes(formattedDate);
    }
    return false;
  };

  return (
    <div className="interior-consulting">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-20 p-4 flex justify-between items-center">
        <Link to="/" className="text-blue font-bold text-xl">MOC Studio</Link>
        <button
          onClick={() => window.scrollTo(0, 0)}
          className="bg-blue text-white p-2 rounded-full"
        >
          ↑
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] bg-gray-100 flex items-center justify-center mt-12 lg:mt-0">
        <div className="text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-blue mb-4">Interior Consulting</h1>
          <p className="text-xl md:text-2xl text-blue max-w-2xl mx-auto">
            Transform your space with our expert design consultation services
          </p>
        </div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <img
          src="/placeholder/consulting-hero.jpg"
          alt="Interior Design"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {/* Booking Section */}
      <section className="py-8 md:py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 md:p-12 rounded-lg shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-blue mb-2">Book a Consultation</h2>

          {bookingSuccess ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Booking Confirmed!</p>
              <p>We've sent a confirmation to your email. Our team will contact you shortly.</p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Book Another Appointment
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">
                Select an available date and time for your consultation
              </p>

              <div className="mb-4">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full md:w-auto bg-blue text-white px-6 py-3 rounded hover:bg-orange transition duration-300 flex items-center justify-between"
                >
                  {selectedDate || 'Select a date'}
                  <svg
                    className={`w-5 h-5 ml-2 transform ${showDatePicker ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDatePicker && (
                  <div className="mt-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <Calendar
                      onChange={handleDateSelect}
                      value={selectedDate ? new Date(selectedDate) : null}
                      tileContent={tileContent}
                      tileDisabled={tileDisabled}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      className="border-none w-full"
                    />
                  </div>
                )}
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-gray-700 mb-2">Available Times</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded ${selectedTime === time ? 'bg-orange text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTime && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-orange text-white px-6 py-3 rounded hover:bg-blue transition duration-300"
                >
                  Continue to Booking Details
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Selected Appointment</label>
                  <div className="bg-gray-100 p-3 rounded">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {' at '}
                    {selectedTime}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="designFocus" className="block text-gray-700 mb-1">Design Focus</label>
                  <input
                    type="text"
                    id="designFocus"
                    value={designFocus}
                    onChange={(e) => setDesignFocus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="E.g., Living Room, Kitchen, etc."
                  />
                </div>

                <div>
                  <label htmlFor="propertyType" className="block text-gray-700 mb-1">Property Type</label>
                  <input
                    type="text"
                    id="propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="E.g., Apartment, House, etc."
                  />
                </div>

                <div>
                  <label htmlFor="details" className="block text-gray-700 mb-1">Project Details</label>
                  <textarea
                    id="details"
                    rows="4"
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="Tell us about your space, style preferences, and any specific needs..."
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full md:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300 transition duration-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-orange text-white px-6 py-3 rounded hover:bg-blue transition duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue mb-12 text-center">Our Consulting Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Space Planning',
                description: 'Optimal furniture arrangement and traffic flow analysis',
                icon: '📐'
              },
              {
                title: 'Color Consultation',
                description: 'Personalized color schemes for walls, furnishings, and decor',
                icon: '🎨'
              },
              {
                title: 'Furniture Selection',
                description: 'Curated pieces that match your style and budget',
                icon: '🛋️'
              },
              {
                title: 'Lighting Design',
                description: 'Layered lighting plans for functionality and ambiance',
                icon: '💡'
              },
              {
                title: 'Material Selection',
                description: 'Guidance on flooring, countertops, and finishes',
                icon: '🧱'
              },
              {
                title: 'Custom Solutions',
                description: 'Tailored designs for unique spaces and requirements',
                icon: '✨'
              }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-blue mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery Section */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue mb-4">Past Projects</h2>
        <p className="text-gray-600 mb-8">Explore our portfolio of completed interior design projects</p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full ${activeCategory === category ? 'bg-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-64 object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-white text-xl font-bold">{project.title}</h3>
                  <p className="text-white/90">{project.description}</p>
                  <button
                    onClick={() => setActiveImage(project)}
                    className="mt-2 text-white underline hover:text-orange"
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8 bg-blue text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Client Testimonials</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The consultation completely transformed how I view my space. The designer's insights were invaluable.",
                author: "Sarah J.",
                project: "Living Room Redesign"
              },
              {
                quote: "Worth every penny! They helped me avoid costly mistakes and created a cohesive design plan.",
                author: "Michael T.",
                project: "Whole Home Consultation"
              },
              {
                quote: "I was overwhelmed with choices, but their expertise narrowed down perfect options for my style.",
                author: "Lisa M.",
                project: "Kitchen Remodel"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg">
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-white/70">{testimonial.project}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {activeImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            {/* Close button at top right */}
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
            >
              ×
            </button>

            <div className="relative h-64 md:h-96">
              <img
                src={activeImage.images[currentImageIndex]}
                alt={activeImage.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows */}
              {activeImage.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev === 0 ? activeImage.images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev === activeImage.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-blue mb-2">{activeImage.title}</h3>
              <p className="text-gray-600 mb-4">{activeImage.description}</p>

              <div className="flex gap-2 overflow-x-auto py-2">
                {activeImage.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 ${currentImageIndex === idx ? 'ring-2 ring-orange' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Close button at bottom */}
              <button
                onClick={() => setActiveImage(null)}
                className="mt-4 w-full bg-blue text-white py-2 rounded hover:bg-orange"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorConsulting;