document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("tbody");
    const token = `UhPZSvlDOVgpnKRuRZwAJETGaUhCiRGO`;
    const url = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/locationcategories`;

    fetch(url, { headers: { token } })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            data?.results.forEach((station) => {
                const row = document.createElement("tr");

                const idCell = document.createElement("td");
                idCell.textContent = station.id;

                const nameCell = document.createElement("td");
                nameCell.textContent = station.name;

                row.appendChild(idCell);
                row.appendChild(nameCell);

                tbody.appendChild(row);
            });
        });
});
