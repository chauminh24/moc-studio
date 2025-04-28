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
      const sessionRes = await fetch('/api/consulting_sessions', {
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
            special_requirements: formData.specialRequirements
          },
          status: 'scheduled'
        })
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Book Session for {moment(selectedSlot.start).format('LLL')}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="virtual">Virtual Consultation</option>
                  <option value="in-person">In-Person Consultation</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Design Focus</label>
                <input
                  type="text"
                  name="designFocus"
                  value={formData.designFocus}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Property Type</label>
                <input
                  type="text"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleFormChange}
                  min="30"
                  max="240"
                  step="30"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block mb-2 font-medium">Style Preferences</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    'modern',
                    'minimalist',
                    'traditional',
                    'industrial',
                    'scandinavian',
                    'bohemian',
                    'rustic',
                    'coastal',
                    'mid-century',
                    'contemporary',
                  ].map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        name="stylePreferences"
                        value={style}
                        checked={formData.stylePreferences.includes(style)}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      {style}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Budget Range</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
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

              <div>
                <label className="block mb-2 font-medium">Priority Items</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    'seating',
                    'storage',
                    'lighting',
                    'flooring',
                    'wall-treatment',
                    'window-treatment',
                    'decor',
                    'layout',
                  ].map((item) => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        name="priorityItems"
                        value={item}
                        checked={formData.priorityItems.includes(item)}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block mb-2 font-medium">Special Requirements</label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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