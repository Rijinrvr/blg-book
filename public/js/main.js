 document.getElementById("delete-article").addEventListener("click", function(event) {
  
   event.preventDefault();
    axios.delete("http://localhost:3000/articles/delete/"+event.target.getAttribute('dataid'))
    .then(response =>{
      console.log(response);
      alert("deleting post");
      window.location = '/';
    })
    .catch(error => console.log(error))
  });