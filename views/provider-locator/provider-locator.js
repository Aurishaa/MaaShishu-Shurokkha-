// This script runs when provider-locator.html is loaded.

// In-memory data store for providers
let providers = [
    { id: 1, name: 'City General Hospital', type: 'Hospital', address: '123 Main St, Dhaka', phone: '02-1234567', services: 'Pediatrics, Gynecology, Emergency' },
    { id: 2, name: 'Dr. Fatima Rahman Clinic', type: 'Clinic (Pediatrician)', address: '456 Oak Ave, Gulshan', phone: '01711-223344', services: 'Child Health, Vaccinations' },
    { id: 3, name: 'Women & Child Care Center', type: 'Clinic (Gynecologist)', address: '789 Pine Ln, Mirpur', phone: '01912-556677', services: 'Maternal Care, Antenatal' },
    { id: 4, name: 'Green Valley Hospital', type: 'Hospital', address: '101 Elm Rd, Dhanmondi', phone: '02-9876543', services: 'Pediatrics, Gynecology' },
];
let providerSearchQuery = '';

function renderProviderList() {
    const filteredProviders = providers.filter(provider =>
        provider.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
        provider.address.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
        provider.type.toLowerCase().includes(providerSearchQuery.toLowerCase())
    );

    const providerListContainer = document.getElementById('provider-list-container');
    if (!providerListContainer) return;

    let providerListHtml = '';
    if (filteredProviders.length === 0) {
        providerListHtml = '<div class="text-center text-gray-500 py-8">No healthcare providers found matching your search.</div>';
    } else {
        providerListHtml = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${filteredProviders.map(provider => `
                    <div class="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100 flex flex-col">
                        <h4 class="text-xl font-semibold text-blue-800 mb-2">${provider.name}</h4>
                        <p class="text-blue-600 font-medium mb-2">${provider.type}</p>
                        <div class="text-gray-700 space-y-1 flex-grow">
                            <p class="flex items-center"><i data-lucide="map-pin" class="mr-2 text-gray-500 w-4 h-4"></i> ${provider.address}</p>
                            <p class="flex items-center"><i data-lucide="phone" class="mr-2 text-gray-500 w-4 h-4"></i> ${provider.phone}</p>
                            <p class="flex items-center"><i data-lucide="heart-pulse" class="mr-2 text-gray-500 w-4 h-4"></i> Services: ${provider.services}</p>
                        </div>
                        <div class="mt-4 flex space-x-3">
                            <a href="tel:${provider.phone}" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition">Call Now</a>
                            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">Get Directions</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    providerListContainer.innerHTML = providerListHtml;
    window.createLucideIcons(); // Re-render icons for new content
}

function init() {
    renderProviderList();

    const searchInput = document.getElementById('provider-search-input');
    if (searchInput) {
        searchInput.value = providerSearchQuery; // Set initial value
        searchInput.addEventListener('input', (e) => {
            providerSearchQuery = e.target.value;
            renderProviderList();
        });
    }
}

// Make the init function accessible globally
window.provider_locator = {
    init: init
};
