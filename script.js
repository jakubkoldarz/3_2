document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("tbody");
    const token = `UhPZSvlDOVgpnKRuRZwAJETGaUhCiRGO`;
    const url = `https://cors-anywhere.herokuapp.com/https://www.ncei.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&locationid=ZIP:28801&startdate=2010-05-01&enddate=2010-05-01`;

    fetch(url, { headers: { token } })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                document.querySelector("#error").textContent = `Response error`;
            }
        })
        .then((data) => {
            console.log(data);

            data?.results.forEach((station) => {
                const row = document.createElement("tr");

                const idCell = document.createElement("td");
                idCell.textContent = station.datatype;

                const nameCell = document.createElement("td");
                nameCell.textContent = station.station;

                const dateCell = document.createElement("td");
                dateCell.textContent = new Date(station.date).toLocaleDateString();

                row.appendChild(idCell);
                row.appendChild(nameCell);
                row.appendChild(dateCell);

                tbody.appendChild(row);
            });
        });
});
