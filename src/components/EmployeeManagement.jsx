import { useState } from "react";

const tabs = [
  { id: 0, label: "Account" },
  { id: 1, label: "Employment" },
  { id: 2, label: "Personal Info" },
  { id: 3, label: "Address" },
  { id: 4, label: "Gov't IDs" },
  { id: 5, label: "Compensation" },
];

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white";

const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white appearance-none cursor-pointer";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Select({ options, placeholder }) {
  return (
    <div className="relative">
      <select className={selectClass} defaultValue="">
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">▼</div>
    </div>
  );
}

function Tab0() {
  const [show, setShow] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Username">
        <input className={inputClass} type="text" placeholder="e.g. juan.dela.cruz" />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input className={inputClass} type={show ? "text" : "password"} placeholder="Enter password" />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 inset-y-0 text-gray-400 hover:text-gray-600 text-xs font-semibold transition-colors">
            {show ? "HIDE" : "SHOW"}
          </button>
        </div>
      </Field>
      <Field label="Role">
        <Select options={["Admin", "Manager", "User"]} placeholder="Select role" />
      </Field>
    </div>
  );
}

function Tab1() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Department">
        <Select options={["Engineering", "Human Resources", "Finance", "Marketing", "Operations", "IT"]} placeholder="Select department" />
      </Field>
      <Field label="Position">
        <Select options={["Junior Developer", "Senior Developer", "Team Lead", "Manager", "Director", "Executive"]} placeholder="Select position" />
      </Field>
      <Field label="Employee Type">
        <Select options={["Regular", "Probationary", "Contractual", "Part-time", "Seasonal"]} placeholder="Select type" />
      </Field>
      <Field label="Date Hired">
        <input className={inputClass} type="date" />
      </Field>
    </div>
  );
}

function Tab2() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Employee Number">
        <input className={inputClass} type="text" placeholder="e.g. EMP-00001" />
      </Field>
      <Field label="First Name">
        <input className={inputClass} type="text" placeholder="First name" />
      </Field>
      <Field label="Middle Name">
        <input className={inputClass} type="text" placeholder="Middle name" />
      </Field>
      <Field label="Last Name">
        <input className={inputClass} type="text" placeholder="Last name" />
      </Field>
      <Field label="Suffix">
        <Select options={["Jr.", "Sr.", "II", "III", "IV", "N/A"]} placeholder="Select suffix" />
      </Field>
      <Field label="Birthdate">
        <input className={inputClass} type="date" />
      </Field>
      <Field label="Gender">
        <Select options={["Male", "Female", "Prefer not to say"]} placeholder="Select gender" />
      </Field>
      <Field label="Civil Status">
        <Select options={["Single", "Married", "Widowed", "Divorced", "Separated"]} placeholder="Select status" />
      </Field>
      <Field label="Phone Number">
        <input className={inputClass} type="tel" placeholder="+63 9XX XXX XXXX" />
      </Field>
      <Field label="Email Address">
        <input className={inputClass} type="email" placeholder="email@company.com" />
      </Field>
    </div>
  );
}

function Tab3() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Field label="Address Line 1">
          <input className={inputClass} type="text" placeholder="House No., Street, Barangay" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Address Line 2">
          <input className={inputClass} type="text" placeholder="Subdivision, Village (optional)" />
        </Field>
      </div>
      <Field label="City / Municipality">
        <input className={inputClass} type="text" placeholder="e.g. Cebu City" />
      </Field>
      <Field label="Province">
        <input className={inputClass} type="text" placeholder="e.g. Cebu" />
      </Field>
      <Field label="Zip Code">
        <input className={inputClass} type="text" placeholder="e.g. 6000" />
      </Field>
    </div>
  );
}

function Tab4() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="SSS Number">
        <input className={inputClass} type="text" placeholder="XX-XXXXXXX-X" />
      </Field>
      <Field label="PhilHealth Number">
        <input className={inputClass} type="text" placeholder="XX-XXXXXXXXX-X" />
      </Field>
      <Field label="Pag-IBIG / HDMF Number">
        <input className={inputClass} type="text" placeholder="XXXX-XXXX-XXXX" />
      </Field>
      <Field label="TIN">
        <input className={inputClass} type="text" placeholder="XXX-XXX-XXX-XXX" />
      </Field>
    </div>
  );
}

function Tab5() {
  return (
    <div className="grid grid-cols-1 gap-4 max-w-sm">
      <Field label="Basic Salary (PHP)">
        <div className="relative">
          <span className="absolute left-3 inset-y-0 flex items-center text-gray-400 text-sm font-semibold">₱</span>
          <input
            className={inputClass + " pl-7"}
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </Field>
      <p className="text-xs text-gray-400">Enter the employee's monthly basic salary before deductions.</p>
    </div>
  );
}

const tabContent = [Tab0, Tab1, Tab2, Tab3, Tab4, Tab5];

export const EmployeeManagement = () => {
  const [active, setActive] = useState(0);
  const ActiveTab = tabContent[active];

  return (
    <div className="bg-gray-100 min-h-screen p-4 lg:p-6">
      <style>{`
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .tab-panel { animation: fadeIn 0.18s ease; }
        .tab-scroll::-webkit-scrollbar { height: 0; }
      `}</style>

      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Employee Management</p>
        <h1 className="text-xl font-bold text-gray-800">New Employee Record</h1>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      
        <div className="tab-scroll flex overflow-x-auto bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex-1 min-w-0 px-2 sm:px-5 py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-all relative
                ${active === tab.id
                  ? "text-blue-600 bg-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}>
              <span className="block truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Progress stepper */}
        <div className="px-4 sm:px-8 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center">
            {tabs.map((tab, i) => (
              <div key={tab.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => setActive(tab.id)}
                    className={`relative flex-shrink-0 w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200
                      ${active === tab.id
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : tab.id < active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                      }`}
                  >
                    {tab.id < active ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      tab.id + 1
                    )}
                  </button>
                  <span className={`hidden sm:block text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
                    ${active === tab.id ? "text-blue-600" : tab.id < active ? "text-blue-400" : "text-gray-300"}`}>
                    {tab.label}
                  </span>
                </div>
                {i < tabs.length - 1 && (
                  <div className="flex-1 mx-1.5 mb-4 sm:mb-5 h-0.5 rounded-full overflow-hidden bg-gray-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${tab.id < active ? "w-full bg-blue-500" : "w-0"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 lg:p-6 tab-panel" key={active}>
          <ActiveTab />
        </div>
        <div className="px-5 lg:px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <button
            onClick={() => setActive((p) => Math.max(0, p - 1))}
            disabled={active === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Back
          </button>

          <span className="text-xs text-gray-400 font-medium">
            Step {active + 1} of {tabs.length}
          </span>

          {active < tabs.length - 1 ? (
            <button
              onClick={() => setActive((p) => Math.min(tabs.length - 1, p + 1))}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm">
              Next →
            </button>
          ) : (
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm">
              ✓ Save Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
}