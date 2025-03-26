import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InteriorConsulting = () => {
  // State for booking form
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // State for gallery
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeImage, setActiveImage] = useState(null);

  // Fetch available times when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  // Mock function to fetch available times from MongoDB
  const fetchAvailableTimes = async (date) => {
    setIsLoading(true);
    try {
      // This would be your actual API call to MongoDB
      // const response = await fetch(`/api/availability?date=${date}`);
      // const data = await response.json();
      
      // Mock response - replace with your actual API call
      const mockTimes = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
      setAvailableTimes(mockTimes);
      setSelectedTime('');
    } catch (error) {
      console.error('Error fetching available times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would be your actual API call to MongoDB
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     date: selectedDate,
      //     time: selectedTime,
      //     name,
      //     email,
      //     phone,
      //     projectDetails
      //   })
      // });
      
      // Mock success - replace with actual response handling
      setTimeout(() => {
        setBookingSuccess(true);
        setIsLoading(false);
        // Reset form
        setSelectedDate('');
        setSelectedTime('');
        setName('');
        setEmail('');
        setPhone('');
        setProjectDetails('');
      }, 1500);
    } catch (error) {
      console.error('Error submitting booking:', error);
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

  return (
    <div className="interior-consulting">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-100 flex items-center justify-center">
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

      {/* Booking Form Section */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-blue mb-2">Book a Consultation</h2>
          <p className="text-gray-600 mb-8">
            Schedule a 1-hour consultation with our interior design experts. 
            We'll discuss your vision, budget, and create a customized plan.
          </p>
          
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    id="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-gray-700 mb-2">Select Time</label>
                  <select
                    id="time"
                    required
                    disabled={!selectedDate || isLoading}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                  >
                    <option value="">{isLoading ? 'Loading...' : 'Select a time'}</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
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
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
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
                <label htmlFor="details" className="block text-gray-700 mb-2">Project Details</label>
                <textarea
                  id="details"
                  rows="4"
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Tell us about your space, style preferences, and any specific needs..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-orange text-white px-8 py-3 rounded hover:bg-blue transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Booking...' : 'Book Consultation'}
              </button>
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

      {/* Image Modal */}
      {activeImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 text-white text-4xl"
          >
            &times;
          </button>
          
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img 
                src={activeImage.images[0]} 
                alt={activeImage.title} 
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-blue mb-2">{activeImage.title}</h3>
              <p className="text-gray-600 mb-4">{activeImage.description}</p>
              
              <div className="flex gap-2 overflow-x-auto py-2">
                {activeImage.images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`${activeImage.title} ${idx + 1}`}
                    className="w-20 h-20 object-cover cursor-pointer hover:opacity-80"
                    onClick={() => setActiveImage({...activeImage, images: [...activeImage.images.slice(idx), ...activeImage.images.slice(0, idx)]})}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorConsulting;