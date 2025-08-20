import { useState, useEffect } from "react";

interface Province {
  id: string;
  name: string;
  completed?: boolean;
}

function App() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [randomizedList, setRandomizedList] = useState<Province[]>([]);
  const [savedLists, setSavedLists] = useState<
    { id: string; name: string; list: Province[]; createdAt: string }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedProvinces = localStorage.getItem("provinces");
      const savedRandomizedList = localStorage.getItem("randomizedList");
      const savedListsData = localStorage.getItem("savedLists");

      if (savedProvinces) {
        const parsedProvinces = JSON.parse(savedProvinces);
        if (Array.isArray(parsedProvinces)) {
          setProvinces(parsedProvinces);
        }
      }

      if (savedRandomizedList) {
        const parsedRandomizedList = JSON.parse(savedRandomizedList);
        if (Array.isArray(parsedRandomizedList)) {
          setRandomizedList(parsedRandomizedList);
        }
      }

      if (savedListsData) {
        const parsedSavedLists = JSON.parse(savedListsData);
        if (Array.isArray(parsedSavedLists)) {
          setSavedLists(parsedSavedLists);
        }
      }
      setIsInitialLoad(false); // Mark initial load as complete
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("provinces");
      localStorage.removeItem("randomizedList");
      localStorage.removeItem("savedLists");
      setIsInitialLoad(false);
    }
  }, []);

  // Save provinces to localStorage whenever provinces change
  useEffect(() => {
    if (!isInitialLoad) {
      try {
        localStorage.setItem("provinces", JSON.stringify(provinces));
      } catch (error) {
        console.error("Error saving provinces to localStorage:", error);
      }
    }
  }, [provinces, isInitialLoad]);

  // Save randomized list to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialLoad) {
      try {
        localStorage.setItem("randomizedList", JSON.stringify(randomizedList));
      } catch (error) {
        console.error("Error saving randomized list to localStorage:", error);
      }
    }
  }, [randomizedList, isInitialLoad]);

  // Save saved lists to localStorage whenever they change
  useEffect(() => {
    if (!isInitialLoad) {
      try {
        localStorage.setItem("savedLists", JSON.stringify(savedLists));
      } catch (error) {
        console.error("Error saving saved lists to localStorage:", error);
      }
    }
  }, [savedLists, isInitialLoad]);

  const addProvince = () => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      setErrorMessage("Please enter a province name");
      setSuccessMessage("");
      return;
    }

    if (
      provinces.some((p) => p.name.toLowerCase() === trimmedInput.toLowerCase())
    ) {
      setErrorMessage("This province name already exists");
      setSuccessMessage("");
      return;
    }

    const newProvince: Province = {
      id: Date.now().toString(),
      name: trimmedInput,
    };
    setProvinces([...provinces, newProvince]);
    setInputValue("");
    setErrorMessage(""); // Clear any previous error
    setSuccessMessage(`"${trimmedInput}" added successfully!`);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const removeProvince = (id: string) => {
    setProvinces(provinces.filter((p) => p.id !== id));
    // Also remove from randomized list if present
    setRandomizedList(randomizedList.filter((p) => p.id !== id));
  };

  const clearAllProvinces = () => {
    setProvinces([]);
    setRandomizedList([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const clearAllSavedLists = () => {
    if (
      confirm(
        "Are you sure you want to delete all saved lists? This action cannot be undone."
      )
    ) {
      setSavedLists([]);
      setSuccessMessage("All saved lists deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const randomizeList = () => {
    if (provinces.length === 0) return;

    const shuffled = [...provinces].sort(() => Math.random() - 0.5);
    // Reset completed status when randomizing
    const shuffledWithoutCompleted = shuffled.map((province) => ({
      ...province,
      completed: false,
    }));
    setRandomizedList(shuffledWithoutCompleted);
  };

  const toggleComplete = (id: string) => {
    setRandomizedList(
      randomizedList.map((province) =>
        province.id === id
          ? { ...province, completed: !province.completed }
          : province
      )
    );
  };

  const toggleCompleteSavedList = (savedListId: string, provinceId: string) => {
    setSavedLists(
      savedLists.map((savedList) =>
        savedList.id === savedListId
          ? {
              ...savedList,
              list: savedList.list.map((province) =>
                province.id === provinceId
                  ? { ...province, completed: !province.completed }
                  : province
              ),
            }
          : savedList
      )
    );
  };

  const saveRandomList = () => {
    if (randomizedList.length === 0) return;

    const listName = prompt("Enter a name for this list:");
    if (!listName || !listName.trim()) return;

    const newSavedList = {
      id: Date.now().toString(),
      name: listName.trim(),
      list: [...randomizedList],
      createdAt: new Date().toISOString(),
    };

    setSavedLists([...savedLists, newSavedList]);
    setSuccessMessage(`List "${listName.trim()}" saved successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addProvince();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (errorMessage) {
      setErrorMessage(""); // Clear error when user starts typing
    }
    if (successMessage) {
      setSuccessMessage(""); // Clear success message when user starts typing
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Random Province Selector
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Add Provinces
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter province name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addProvince}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            {/* Province List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {provinces.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No provinces added yet
                </p>
              ) : (
                provinces.map((province) => (
                  <div
                    key={province.id}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-gray-700">{province.name}</span>
                    <button
                      onClick={() => removeProvince(province.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={randomizeList}
                disabled={provinces.length === 0}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                🎲 Random Select ({provinces.length} provinces)
              </button>
              {provinces.length > 0 && (
                <button
                  onClick={clearAllProvinces}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Clear All Provinces
                </button>
              )}
            </div>
          </div>

          {/* Randomized List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Random List
              </h2>
              <div className="flex gap-2">
                {randomizedList.length > 0 && (
                  <>
                    <button
                      onClick={saveRandomList}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      💾 Save List
                    </button>
                    <button
                      onClick={randomizeList}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Re-randomize
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {randomizedList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {provinces.length === 0
                    ? "Add some provinces first, then click Random Select"
                    : "Click 'Random Select' to generate a randomized list"}
                </p>
              ) : (
                randomizedList.map((province, index) => (
                  <div
                    key={province.id}
                    className={`flex items-center bg-gradient-to-r px-3 py-2 rounded-md border-l-4 transition-all ${
                      province.completed
                        ? "from-green-50 to-green-100 border-green-500 opacity-75"
                        : "from-blue-50 to-green-50 border-blue-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={province.completed || false}
                      onChange={() => toggleComplete(province.id)}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-600 mr-3 w-8">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-gray-700 font-medium ${
                        province.completed ? "line-through" : ""
                      }`}
                    >
                      {province.name}
                    </span>
                  </div>
                ))
              )}
            </div>

            {randomizedList.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <p>✅ List saved automatically</p>
                  <p className="text-gray-500">
                    Completed:{" "}
                    {randomizedList.filter((p) => p.completed).length}/
                    {randomizedList.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Lists Section */}
        {savedLists.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Saved Lists ({savedLists.length})
              </h2>
              <button
                onClick={clearAllSavedLists}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLists.map((savedList) => (
                <div
                  key={savedList.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {savedList.name}
                    </h3>
                    <button
                      onClick={() => {
                        setSavedLists(
                          savedLists.filter((list) => list.id !== savedList.id)
                        );
                        setSuccessMessage("List deleted successfully!");
                        setTimeout(() => setSuccessMessage(""), 3000);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Created:{" "}
                    {new Date(savedList.createdAt).toLocaleDateString()}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {savedList.list.map((province, index) => (
                      <div
                        key={province.id}
                        className={`flex items-center text-sm p-1 rounded transition-all ${
                          province.completed
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={province.completed || false}
                          onChange={() =>
                            toggleCompleteSavedList(savedList.id, province.id)
                          }
                          className="mr-2 h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span
                          className={`flex-1 ${
                            province.completed
                              ? "line-through text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          #{index + 1} {province.name}
                        </span>
                        {province.completed && (
                          <span className="ml-1 text-green-600 text-xs">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    Completed:{" "}
                    {savedList.list.filter((p) => p.completed).length}/
                    {savedList.list.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            How it works:
          </h3>
          <ul className="text-gray-600 space-y-1">
            <li>
              • Add province names using the input field (names must be unique)
            </li>
            <li>• Click "Random Select" to generate a randomized list</li>
            <li>• Use "Re-randomize" to shuffle the same provinces again</li>
            <li>• Check the boxes next to items to mark them as complete</li>
            <li>
              • Click "💾 Save List" to permanently save your randomized list
              with completion status
            </li>
            <li>
              • Interact with checkboxes in saved lists to update completion
              status
            </li>
            <li>
              • Your data is automatically saved and will persist even after
              page refresh
            </li>
            <li>
              • Use "Clear All Provinces" to remove all entries and start fresh
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
