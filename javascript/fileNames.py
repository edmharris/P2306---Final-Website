import os
directory = 'folder'
x = 1

for picture in os.listdir(directory):
    print('<img class="slideshow" src="'+picture+'" alt="image "'+x+'"')
    x+1
