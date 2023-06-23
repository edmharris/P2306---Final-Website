import os
directory = 'imagery/Storymap_images'
x = 1

for picture in os.listdir(directory):
    print('<img class="slideshow" src="'+picture+'" alt="image '+str(x)+'">')
    x = x+1
