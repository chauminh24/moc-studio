import React, { useState, useEffect } from 'react';
import moment from 'moment';

const InteriorConsulting = () => {
  const [availability, setAvailability] = useState([]);
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionRes = await fetch('/api/consulting_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_date: selectedSlot.date,
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
        alert('Session booked successfully!');
        setShowBookingModal(false);
      } else {
        throw new Error('Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Interior Design Consulting</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Book a Consultation</h2>
        <div className="bg-white p-4 shadow">
          <div className="grid grid-cols-7 gap-4">
            {availability.map((day) => (
              <div key={day.date} className="border p-2">
                <h3 className="font-semibold">{moment(day.date).format('ddd, MMM D')}</h3>
                {day.time_slots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`block w-full mt-2 p-2 text-sm ${
                      slot.available > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                    }`}
                    disabled={slot.available === 0}
                    onClick={() => handleSelectSlot({ date: day.date, time: slot.time })}
                  >
                    {slot.time} ({slot.available} slots)
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Book Session for {moment(selectedSlot.date).format('LL')} at {selectedSlot.time}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleFormChange}
                  className="w-full p-2 border"
                  required
                >
                  <option value="virtual">Virtual Consultation</option>
                  <option value="in-person">In-Person Consultation</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Design Focus</label>
                <input
                  type="text"
                  name="designFocus"
                  value={formData.designFocus}
                  onChange={handleFormChange}
                  className="w-full p-2 border"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Property Type</label>
                <input
                  type="text"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleFormChange}
                  className="w-full p-2 border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorConsulting;