import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const InteriorConsulting = () => {
  const [availability, setAvailability] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formData, setFormData] = useState({
    sessionType: 'virtual',
    designFocus: '',
    propertyType: '',
    duration: 60,
    stylePreferences: [],
    budgetRange: '',
    priorityItems: [],
    specialRequirements: ''
  });

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/connectDB?type=interiorConsulting');
        const data = await res.json();

        setAvailability(data.availability);
        setProjects(data.projects);
        setSessions(data.sessions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Transform availability data for calendar
  const events = availability.flatMap(day =>
    day.time_slots
      .filter(slot => slot.available > 0)
      .map(slot => ({
        title: `${slot.available} slots available`,
        start: new Date(`${moment(day.date).format('YYYY-MM-DD')}T${slot.time}:00`),
        end: new Date(`${moment(day.date).format('YYYY-MM-DD')}T${slot.time}:00`),
        allDay: false,
        resource: {
          available: slot.available,
          capacity: slot.capacity
        }
      }))
  );

  const handleSelectSlot = (slot) => {
    console.log("Selected Slot:", slot); // Debugging log
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create session
      const sessionRes = await fetch('/api/connectDB?type=createConsultingSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_date: selectedSlot.start,
          session_type: formData.sessionType,
          design_focus: formData.designFocus,
          property_type: formData.propertyType,
          duration: formData.duration,
          client_requirements: {
            style_preferences: formData.stylePreferences,
            budget_range: formData.budgetRange,
            priority_items: formData.priorityItems,
            special_requirements: formData.specialRequirements,
          },
          status: 'scheduled',
        }),
      });

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        alert('Session booked successfully!');
        setShowBookingModal(false);
        // Refresh sessions list
        const updatedSessions = await fetch('/api/consulting_sessions').then(res => res.json());
        setSessions(updatedSessions);
      } else {
        throw new Error('Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  return (
    <div className="container mx-auto pt-[10em] px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        Interior Design Consulting
      </h1>

      {/* Booking Section */}
      <section className="mb-8 px-4">
        <h2 className="text-xl font-bold text-blue mb-12 text-center">
          Book a Consultation
        </h2>
        <div className="bg-white p-3 shadow rounded-lg w-full max-w-lg mx-auto">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "250px" }} // Smaller height for mobile
            className="md:h-[500]" // Larger height for bigger screens
            onSelectEvent={handleSelectSlot}
            selectable
            views={["month", "week", "day"]}
            defaultView="month"
            min={new Date(0, 0, 0, 9, 0, 0)} // 9 AM
            max={new Date(0, 0, 0, 18, 0, 0)} // 6 PM
          />
        </div>
      </section>


      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Book Session for {moment(selectedSlot.start).format('LLL')}
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Session Type*</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  required
                >
                  <option value="virtual">Virtual Consultation</option>
                  <option value="in-person">In-Person Consultation</option>
                </select>
              </div>

              {/* Design Focus */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Design Focus*</label>
                <input
                  type="text"
                  name="designFocus"
                  value={formData.designFocus}
                  onChange={handleFormChange}
                  placeholder="e.g., Living room, Kitchen, Office"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  required
                />
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Property Type*</label>
                <input
                  type="text"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleFormChange}
                  placeholder="e.g., Apartment, House, Commercial"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  required
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)*</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleFormChange}
                  min="30"
                  max="240"
                  step="30"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  required
                />
                <p className="text-xs text-gray-500">Available durations: 30, 60, 90, 120, 150, 180, 210, 240 minutes</p>
              </div>

              {/* Style Preferences */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Style Preferences</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    'Modern', 'Minimalist', 'Traditional', 'Industrial',
                    'Scandinavian', 'Bohemian', 'Rustic', 'Coastal',
                    'Mid-century', 'Contemporary'
                  ].map((style) => (
                    <label key={style} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="stylePreferences"
                        value={style.toLowerCase()}
                        checked={formData.stylePreferences.includes(style.toLowerCase())}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Budget Range*</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  required
                >
                  <option value="">Select budget</option>
                  <option value="<$500">Under $500</option>
                  <option value="$500-$1000">$500 - $1000</option>
                  <option value="$1000-$2000">$1000 - $2000</option>
                  <option value="$2000-$5000">$2000 - $5000</option>
                  <option value=">$5000">Over $5000</option>
                </select>
              </div>

              {/* Priority Items */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Priority Items</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Seating', 'Storage', 'Lighting', 'Flooring',
                    'Wall Treatment', 'Window Treatment', 'Decor', 'Layout'
                  ].map((item) => (
                    <label key={item} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="priorityItems"
                        value={item.toLowerCase().replace(' ', '-')}
                        checked={formData.priorityItems.includes(item.toLowerCase().replace(' ', '-'))}
                        onChange={handleFormChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Requirements */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleFormChange}
                  placeholder="Any specific needs or additional information..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  rows="3"
                />
              </div>

              {/* Form Actions */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange hover:bg-dark-orange text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Our Services Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-blue mb-12 text-center">Our Consulting Services</h2>

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


      {/* Past Projects */}
      <section>
        <h2 className="text-xl font-bold text-blue mb-12 text-center">
          Past Projects
        </h2>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-white p-4 shadow rounded-lg">
                <h3 className="font-semibold">{project.title}</h3>
                <p>Status: {project.status}</p>
                <p>Created: {moment(project.created_at).format('LL')}</p>
                {project.completed_at && (
                  <p>Completed: {moment(project.completed_at).format('LL')}</p>
                )}
                <p className="mt-2">{project.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No past projects found.</p>
        )}
      </section>
    </div>
  );
};

export default InteriorConsulting;