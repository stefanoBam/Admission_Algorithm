import csv
import pandas as pd
import numpy as np 

df_0 = pd.read_csv('Admit_table_wCat.csv')
df = pd.DataFrame(df_0)
#print(df.to_string())

col1 = "Diagnosis/Presenting problem"
col2 = "Specific Factors 1"

input2= "Malignant"
input3= "New diagnosis"
print(df.columns)
#print(list(df['Admitting Service']))

print("What is the presenting problem?")
input1 = str(input())
indeces = []

for i,r in df[[col1]].iterrows():
   # print(r[0])
   #if input in r[0]:
    #   print(r[0])
    if not str(r[0]).find(input1):
        print(r[0])
        indeces.append(i)

print(indeces)
secondrow = set([])
for i in indeces:
    secondrow.add(df[col2][i])
print("Pick one of the following options:")
print(secondrow)
input2=str(input())
#for in [i]

for i,r in df[[col2]].iterrows():
   # print(r[0])
   #if input in r[0]:
    #   print(r[0])
    if i in indeces:
        if not str(r).find(input2):
            print(r)

'''
for i,r in df[[col2]].iterrows():
   # print(r[0])
   #if input in r[0]:
    #   print(r[0])
    if not str(r[0]).find(input1):

        if not str(r[1]).find(input2):
            if not str(r[2]).find(input3):
                print(r[3])
'''
