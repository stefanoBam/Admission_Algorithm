import streamlit as st

from thefuzz import fuzz, process
import csv
import pandas as pd
import numpy as np
import os
import json

#Define global out and in variables to control rendered text
curr_out = "OUT"
curr_in = "IN"

## Import libraries and open CSV

def initialize_csv(csv_name):
  #print(os.path.isfile(csv_name))
  df_0 = pd.read_csv(csv_name)
  df = pd.DataFrame(df_0)
  #print(df.to_string())

  col1 = "Diagnosis/Presenting problem"
  col2 = "Specific Factors 1"
  col3 = "Specific Factors 2"
  col4 = "Admitting Service"
  col5 = "Notes"
  col6 = "System"
  col7 = "Mechanism"
  #print(df.columns)
  return(df, col1, col2, col3, col4, col5, col6, col7)

## Parse User Input
_ = """
def parse_user(prompt, choices = 0):
  #define the globals here to let this function write to them
  global curr_out
  global curr_in

  if prompt: curr_out = "\n"+prompt
  if choices: print(choices)
  input1 = str(curr_in)
  #TODO: Add parsing if necessary
  return input1
"""

##Search functions

#function that will take the user input,df,specified row to search in to match userInput, and outputs a new df with top matches (highest ratio from fuzzy search)
def fuzzysearch(userInput, df, r, top1 = False):

  #compute a ratio between user input and "text" column of df (block of code that I copy pasted from below)
  c = []
  for index, row in df.iterrows():
      b = ''.join(str(x) for x in row[r])
      c.append ([index,fuzz.token_set_ratio(userInput,b),b])

  cT = np.array(c).T
  #df['ratio'] = list(map(int, cT[1]))
  df.loc[:, 'ratio'] = list(map(int, cT[1])) #changed the above line to this line due to warning messages

  max_ratio = df["ratio"].max() #finds the best match

  #sub1.iloc[0:0]
  if top1: #if top1 is True (specified in the parameters)
    sub1 = df.loc[df['ratio'] == max_ratio]
  else: #default: if top1 is not specified in the parameters as True, the default will return a table w max ratio-5
    sub1 = df.loc[df['ratio'] >= (max_ratio - 5)] #subtable with the best ratios (anything that's >= max-5)

  return sub1

#function that will take the user input,df,specified row to search in to match userInput, and outputs a new df with top matches (highest ratio from fuzzy search)
def explicitSearch(userInput, df, r):
  mask = df[r].str.contains(userInput)
  #print(mask)
  mask = mask.replace(np.NaN,True)

  sub1 = df[mask]
  sub1.to_csv("sub1_content.csv")
  return sub1




##MAIN
#Incoporates code from Robert et. Al <3
#Calls initialize_csv function and assigns the output values
df, col1, col2, col3, col4, col5, col6, col7 = initialize_csv('Admit_table_wCat_csv.csv')


#Compresses the text contents from all the columns of the dataframe into a list with one column, comma seperated text
##This will be what we fuzzy search into
df['text'] = df[[col1, col2, col3, col4, col5	]].astype(str).values.tolist()

# Converts col1 of the dataframe to a list, then converts to set to remove duplicates, then converts back to list to pass to classifier
labels = list(set(df[col1].tolist()))

# Import initial button categories from categories.json
cat_file = open("categories.json")
categories = json.load(cat_file)
system_labels = categories["system"]
mechanism_labels = categories["mechanism"]

_ = """
system_selection = parse_user("Please select from the following systems:\n" + str(system_labels))
mechanism_selection = parse_user("Please select from the following mechanisms:\n" + str(mechanism_labels))

sub0_sys = explicitSearch(system_selection, df, col6)
sub0_mech = explicitSearch(mechanism_selection, sub0_sys, col7)


prompt1 = parse_user("What is the presenting problem? Please use the shortest descriptor possible.")
ratios = []

sub1 = fuzzysearch(prompt1,sub0_mech,"text")

#asking the user to choose best match
prompt2 = parse_user("Which of the following categories is most likely?", list(set(sub1[col1].tolist())))

sub2 = fuzzysearch(prompt2,sub1,col1,True)

if sub2.shape[0] == 1:
  print("Admitting service: " + str(sub2[col4].values[:]))

##ADD another layer of search with the first subset column
#this is not done yet
else:
  sf1 = sub2[col2]
  sf2 = sub2[col3]
  #print(sf1)
  #print(sf2)

  if not sf1.isnull().all(): #check if specifying factor 1 is empty or not, if it is, goes on to see if there are any specifying factor 2
    prompt_sf1 = parse_user("Please choose a specifying factor", list(set(sf1.tolist())))
    sub3 = fuzzysearch(prompt_sf1, sub2, col2)
    print(sub3)

  elif not sf2.isnull().all():
    prompt_sf2 = parse_user("Please choose a specifying factor", list(set(sf2.tolist())))
    sub3 = fuzzysearch(prompt_sf2, sub2, col3)
    print(sub3)

  else: #if no specifying factor, list all possible admitting services
    print("\nAdmitting services: " + str(sub2[col4].values[:])) #prints all the possible admitting services if there are no specific factors 1 and 2
"""



##RENDER
st.write("**Emergency Room Admission Algorithm:**")


_ = """ with st.form("my_form"):
   st.write("**Form container:**")

   #mechanism_selection = st.multiselect('Pick a mechanism', system_labels)
   #system_selection = st.multiselect('Pick a system', mechanism_labels)
   mechanism_selection = st.selectbox('Pick a mechanism', system_labels)
   system_selection = st.selectbox('Pick a system', mechanism_labels)
   #manual = st.text_input("Manual Search")
   st.form_submit_button('Submit my picks') """


mechanism_selection = st.selectbox('Pick a mechanism',mechanism_labels )
system_selection = st.selectbox('Pick a system', system_labels)
# This is outside the form
#st.write("Mechanism: ",mechanism_selection)
#st.write("System:", system_selection)
#st.write("\n\n")
#st.write("Manual search: ", manual)

sub0_sys = explicitSearch(system_selection, df, col6)
sub0_mech = explicitSearch(mechanism_selection, sub0_sys, col7)

st.write(sub0_mech) 

with st.container():
    message = st.chat_message("assistant")
    message.write("What is the presenting problem? Please use the shortest descriptor possible.")
    prompt1 = st.chat_input("User input")

    st.write("\n", prompt1)

sub1 = fuzzysearch(prompt1,sub0_mech,"text")

st.write(sub1)






